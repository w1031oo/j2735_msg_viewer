<template>
  <v-card>
    <v-overlay
      v-model="mapStore.state.isLoading"
      class="align-center justify-center text-h4"
    >
      Loading...
    </v-overlay>

    <!-- Error Message -->
    <div v-if="mapStore.state.mapError" class="error-message">
      {{ mapStore.state.mapError }}
    </div>

    <v-layout>
      <v-navigation-drawer expand-on-hover permanent rail>
        <v-list>
          <v-list-item :prepend-avatar="logo">
            <img :src="logo" alt="Logo" />
          </v-list-item>
        </v-list>

        <v-divider></v-divider>

        <v-list v-model:opened="open" density="compact">
          <v-list-group value="Map">
            <template v-slot:activator="{ props }">
              <v-list-item
                v-bind="props"
                prepend-icon="mdi-map-marker"
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
          <!-- <div class="pa-2">
            <v-btn
              append-icon="mdi-account-circle"
              prepend-icon="mdi-check-circle"
            >
              Clear
            </v-btn>
          </div> -->
        </template>
      </v-navigation-drawer>

      <v-main style="height: 100vh">
        <div id="map"></div>
      </v-main>
    </v-layout>

    <v-bottom-sheet v-model="mapStore.bottomSheetState.isOpen" inset>
      <v-card class="text-center" height="200">
        <v-card-title>{{ mapStore.bottomSheetState.title }}</v-card-title>
        <v-card-text>
          <div>{{ mapStore.bottomSheetState.text }}</div>

          <br />
          <br />

          <v-btn
            text="Close"
            variant="text"
            @click="
              mapStore.bottomSheetState.isOpen =
                !mapStore.bottomSheetState.isOpen
            "
          ></v-btn>
        </v-card-text>
      </v-card>
    </v-bottom-sheet>
  </v-card>
</template>

<script setup>
import { nextTick, onMounted, onUnmounted, reactive, ref } from "vue";
import logo from "../assets/logo.png";
// Store
import { useMapStore } from "../stores/mapStore";
import { fa } from "vuetify/locale";
const mapStore = useMapStore();

const modules = import.meta.glob("../assets/map_ksa/*.json");

const open = ref([]); // Map이 처음부터 열림

const state = reactive({
  mapList: [],
});

// import map57JSON from "@/assets/57.json"; // JSON 파일 경로에 맞게 수정 필요
// import mapCestR1JSON from "@/assets/map_cest_r1.json"; // JSON 파일 경로에 맞게 수정 필요

const handleSelect = (path) => {
  loadIntersectionData(path);
  console.log("선택됨:", path);
};

// 교차로 데이터 로드 함수
const loadIntersectionData = async (path) => {
  try {
    const module = await modules[path]();
    console.log("JSON 데이터:", module.default);

    await mapStore.loadIntersectionData(module.default);
  } catch (error) {
    console.error("Failed to load intersection data:", error);
  }
};

// json 리스트 가져오기
const getMapList = () => {
  state.mapList = Object.keys(modules).map((path) => ({
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
  /* position: absolute; */
  /* top: 0;
  bottom: 0;
  left: 0;
  right: 0; */
  width: 100%;
  height: 100%;
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

.control-panel {
  position: fixed;
  top: 10px;
  left: 10px;
  padding: 10px;
  z-index: 900;
}

.control-panel1 {
  position: fixed;
  top: 10px;
  left: 260px;
  background-color: rgba(255, 255, 255, 0.8);
  padding: 10px;
  border-radius: 5px;
  z-index: 900;
}

.control-panel1 button {
  background-color: #3388ff;
  color: white;
  border: none;
  padding: 8px 16px;
  text-align: center;
  cursor: pointer;
  border-radius: 4px;
}

.control-panel1 button:hover {
  background-color: #006aff;
}

.control-panel1 button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.control-panel2 {
  position: fixed;
  top: 10px;
  left: 350px;
  background-color: rgba(255, 255, 255, 0.8);
  padding: 10px;
  border-radius: 5px;
  z-index: 900;
}

.control-panel2 button {
  background-color: #3388ff;
  color: white;
  border: none;
  padding: 8px 16px;
  text-align: center;
  cursor: pointer;
  border-radius: 4px;
}

.control-panel2 button:hover {
  background-color: #006aff;
}

.control-panel2 button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.control-panel3 {
  position: fixed;
  top: 10px;
  left: 510px;
  background-color: rgba(255, 255, 255, 0.8);
  padding: 10px;
  border-radius: 5px;
  z-index: 900;
}

.control-panel3 button {
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 8px 16px;
  text-align: center;
  cursor: pointer;
  border-radius: 4px;
}

.control-panel3 button:hover {
  background-color: #45a049;
}

.control-panel3 button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}
</style>
