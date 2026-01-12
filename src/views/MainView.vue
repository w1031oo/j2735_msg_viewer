<template>
  <v-overlay
    v-model="mapStore.state.isLoading"
    class="align-center justify-center text-h4"
  >
    <v-progress-circular
      :size="64"
      :width="6"
      indeterminate
    ></v-progress-circular>
  </v-overlay>

  <!-- Error Message -->
  <div v-if="mapStore.state.mapError" class="error-message">
    {{ mapStore.state.mapError }}
  </div>

  <v-layout style="height: 100vh">
    <v-navigation-drawer expand-on-hover permanent rail>
      <v-list>
        <v-list-item>
          <template #prepend>
            <v-avatar>
              <v-icon>mdi-map-marker</v-icon>
            </v-avatar>
          </template>
          <img :src="logo" alt="Logo" />
        </v-list-item>
      </v-list>

      <v-divider></v-divider>

      <v-list v-model:opened="open" density="compact">
        <v-list-group value="Map">
          <template v-slot:activator="{ props }">
            <v-list-item
              v-bind="props"
              prepend-icon="mdi-map"
              title="MAP"
            ></v-list-item>
          </template>
          <v-list-item
            v-for="({ name, path }, i) in state.mapList"
            :key="i"
            prepend-icon="mdi-folder"
            :title="name"
            :value="path"
            @click="handleSelect(path)"
          ></v-list-item>
        </v-list-group>
      </v-list>

      <template v-slot:append>
        <v-list color="transparent">
          <v-list-item prepend-icon="mdi-delete">
            <div class="pa-2">
              <v-btn block @click="mapStore.cleanupLayers()"> Clear </v-btn>
            </div>
          </v-list-item>
        </v-list>
      </template>
    </v-navigation-drawer>

    <v-main class="map-component">
      <div id="map" style="width: 100%; height: 100%"></div>
      <v-card v-if="mapStore.state.fileInfo" class="file-name d-inline-block">
        <v-card-title>{{ mapStore.state.fileInfo?.fileName }}</v-card-title>
        <v-card-text>
          <div class="info-item">
            <span class="label">region:</span>
            <span>{{ mapStore.state.fileInfo?.region }}</span>
          </div>
          <div class="info-item">
            <span class="label">id:</span>
            <span>{{ mapStore.state.fileInfo?.id }}</span>
          </div>
          <div class="info-item">
            <span class="label">timestamp:</span>
            <span>{{ mapStore.state.fileInfo?.timestamp }}</span>
          </div>
          <div class="info-item">
            <span class="label">speedLimits:</span>
            <span>{{ mapStore.state.fileInfo?.speedLimits }}</span>
          </div>
          <div class="info-item">
            <span class="label">revision:</span>
            <span>{{ mapStore.state.fileInfo?.revision }}</span>
          </div>
          <div class="info-item">
            <span class="label">msgIssueRevision:</span>
            <span>{{ mapStore.state.fileInfo?.msgIssueRevision }}</span>
          </div>
          <div class="info-item">
            <span class="label">layerType:</span>
            <span>{{ mapStore.state.fileInfo?.layerType }}</span>
          </div>
          <div class="info-item">
            <span class="label">laneSetCount:</span>
            <span>{{ mapStore.state.fileInfo?.laneSetCount }}</span>
          </div>
          <div class="info-item">
            <span class="label">lat:</span>
            <span>{{ mapStore.state.fileInfo?.refPoint?.lat }}</span>
          </div>
          <div class="info-item">
            <span class="label">lng:</span>
            <span>{{ mapStore.state.fileInfo?.refPoint?.lng }}</span>
          </div>
        </v-card-text>
      </v-card>
      <!-- <v-btn class="file-name">test</v-btn> -->
    </v-main>
  </v-layout>
</template>

<script setup>
import { nextTick, onMounted, onUnmounted, reactive, ref } from "vue";
import logo from "../assets/logo.png";
// Store
import { useMapStore } from "../stores/mapStore";
const mapStore = useMapStore();

const mapModules = import.meta.glob("../assets/j2735_msg/map/*.json");

const open = ref([]); // Map이 처음부터 열림

const state = reactive({
  mapList: [],
});

const handleSelect = (path) => {
  loadIntersectionData(path);
};

// 교차로 데이터 로드 함수
const loadIntersectionData = async (path) => {
  try {
    const module = await mapModules[path]();

    await mapStore.loadIntersectionData(module.default, path.split("/").pop());
  } catch (error) {
    console.error("Failed to load intersection data:", error);
  }
};

// json 리스트 가져오기
const getMapList = () => {
  state.mapList = Object.keys(mapModules).map((path) => ({
    path: path,
    name: path.split("/").pop(),
  }));
};

onMounted(async () => {
  try {
    // DOM이 완전히 렌더링된 후 실행
    await nextTick();

    getMapList();

    const mapContainer = document.getElementById("map");
    if (mapContainer) {
      mapContainer.innerHTML = "";

      mapStore.initMap("map");
    } else {
      console.error("Map container not found");
      return;
    }
  } catch (error) {
    mapStore.state.mapError = "Failed to initialize map";
    console.error("Map initialization error:", error);
  }
});

onUnmounted(() => {
  mapStore.cleanUp();
});
</script>

<style>
/* 전역 스타일 - scoped 제거 */

/* #app {
  height: 100vh;
  width: 100vw;
} */

#map {
  position: absolute;
  /* top: 0;
  bottom: 0;
  left: 0;
  right: 0; */
  width: 100%;
  height: 100%;
  z-index: 0;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  font-size: 1.5rem;
}

.error-message {
  position: fixed;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(255, 0, 0, 0.7);
  color: white;
  padding: 10px 20px;
  border-radius: 5px;
  z-index: 1000;
  max-width: 80%;
}

.logo {
  position: fixed;
  top: 20px;
  left: 20px;
}

.map-component {
  position: relative;
  width: 100%; /* 전체 너비 - Route 패널 너비 */
  height: 100%;
  overflow: hidden; /* 중요: 오버플로우 숨김 */
}

.file-name {
  position: absolute;
  left: 10px;
  top: 10px;
  z-index: 1000;
  width: auto;
  min-width: 250px;
}

.info-item {
  display: flex;
  gap: 8px;
  margin-bottom: 4px;
}

.label {
  font-weight: bold;
  min-width: 140px;
}

/* .file-name {
  position: absolute;
  left: 10px;
  top: 10px;
  z-index: 1000;
} */
</style>
