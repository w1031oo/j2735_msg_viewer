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

  <!-- eslint-disable-next-line vue/no-multiple-template-root -->
  <v-layout style="height: 100vh">
    <v-navigation-drawer expand-on-hover permanent rail :width="320">
      <template v-slot:prepend>
        <v-list>
          <v-list-item>
            <template #prepend>
              <v-avatar>
                <v-icon>mdi-map-marker</v-icon>
              </v-avatar>
            </template>
            <div class="d-flex justify-center">
              <img :src="logo" alt="Logo" />
            </div>
          </v-list-item>
        </v-list>
        <v-divider></v-divider>
      </template>

      <v-list :opened="open" density="compact">
        <v-list-group value="Map">
          <template v-slot:activator="{ props }">
            <v-list-item
              v-bind="props"
              prepend-icon="mdi-map"
              title="MAP"
            ></v-list-item>
          </template>

          <!-- J2735 폴더 -->
          <v-list-group value="j2735">
            <template v-slot:activator="{ props }">
              <v-list-item
                v-bind="props"
                prepend-icon="mdi-folder"
                title="J2735"
              ></v-list-item>
            </template>
            <v-list-item
              v-for="file in state.j2735Files"
              :key="file.path"
              prepend-icon="mdi-file"
              :title="file.name"
              @click="handleFileSelect(file.path)"
            ></v-list-item>
          </v-list-group>

          <!-- KSA 폴더 -->
          <v-list-group value="ksa">
            <template v-slot:activator="{ props }">
              <v-list-item
                v-bind="props"
                prepend-icon="mdi-folder"
                title="KSA"
              ></v-list-item>
            </template>
            <v-list-item
              v-for="file in state.ksaFiles"
              :key="file.path"
              prepend-icon="mdi-file"
              :title="file.name"
              @click="handleFileSelect(file.path)"
            ></v-list-item>
          </v-list-group>

          <!-- UPER 폴더 -->
          <v-list-group value="uper">
            <template v-slot:activator="{ props }">
              <v-list-item
                v-bind="props"
                prepend-icon="mdi-folder"
                title="UPER"
              ></v-list-item>
            </template>
            <v-list-item
              v-for="file in state.uperFiles"
              :key="file.path"
              prepend-icon="mdi-file"
              :title="file.name"
              @click="handleFileSelect(file.path)"
            ></v-list-item>
          </v-list-group>
        </v-list-group>
      </v-list>

      <template v-slot:append>
        <v-divider></v-divider>
        <v-list color="transparent">
          <v-list-item prepend-icon="mdi-cog-outline">
            <div class="pa-2 d-flex ga-2">
              <v-btn
                class="flex-grow-1"
                :color="isShowState.fileInfo ? 'primary' : 'grey-darken-1'"
                :variant="isShowState.fileInfo ? 'elevated' : 'tonal'"
                @click="isShowState.fileInfo = !isShowState.fileInfo"
              >
                <v-icon>
                  {{
                    isShowState.fileInfo
                      ? "mdi-text-box"
                      : "mdi-text-box-outline"
                  }}
                </v-icon>
              </v-btn>
              <v-btn
                class="flex-grow-1"
                :color="isShowState.jsonView ? 'secondary' : 'grey-darken-1'"
                :variant="isShowState.jsonView ? 'elevated' : 'tonal'"
                @click="isShowState.jsonView = !isShowState.jsonView"
              >
                <v-icon>
                  {{
                    isShowState.jsonView
                      ? "mdi-file-tree"
                      : "mdi-file-tree-outline"
                  }}
                </v-icon>
              </v-btn>
              <v-btn class="flex-grow-1" @click="mapStore.cleanupLayers()">
                <v-icon>
                  {{ "mdi-delete-outline" }}
                </v-icon>
              </v-btn>
            </div>
          </v-list-item>
        </v-list>
      </template>
    </v-navigation-drawer>

    <v-main class="map-component">
      <!-- map -->
      <div id="map" style="width: 100%; height: 100%"></div>

      <!-- container -->
      <div class="overlay-container">
        <!-- file info -->
        <v-card
          v-if="mapStore.state.fileInfo && isShowState.fileInfo"
          class="file-info d-inline-block"
        >
          <v-card-title class="bg-grey-lighten-3 d-flex align-center">
            <v-icon start>mdi-information-variant</v-icon>
            <span class="text-subtitle-1">
              {{ mapStore.state.fileInfo?.fileName }}
            </span>
          </v-card-title>

          <v-divider></v-divider>

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
        <!-- <v-btn class="file-info">test</v-btn> -->

        <!-- jsonView -->
        <div
          v-if="mapStore.state.fileInfo && isShowState.jsonView"
          class="file-json"
        >
          <json-tree />
        </div>
      </div>
      <!-- <v-sheet
        v-if="mapStore.state.fileInfo && isShowState.jsonView"
        class="file-json"
      >
        <json-tree />
      </v-sheet> -->
    </v-main>
  </v-layout>
</template>

<script setup>
import {
  computed,
  nextTick,
  onMounted,
  onUnmounted,
  reactive,
  ref,
  shallowRef,
  watch,
} from "vue";
import logo from "../assets/logo.png";
// components
import JsonTree from "../components/JsonTree.vue";
// Store
import { useMapStore } from "../stores/mapStore";
const mapStore = useMapStore();
// composables
// import { useSocket } from "../composables/useSocket";
// const { mapData, decodeMap } = useSocket();

// const mapModules = import.meta.glob("../assets/j2735_msg/map/*.json");

const open = ref([]);

const state = reactive({
  // mapList: [],
  j2735Files: [],
  ksaFiles: [],
  uperFiles: [],
});

const isShowState = reactive({
  fileInfo: false,
  jsonView: false,
});

const allFiles = import.meta.glob("../assets/map/**/*.{json,uper}", {
  eager: true,
  as: "url",
});

// 파일 목록 가져오기
const loadFileList = () => {
  const j2735 = [];
  const ksa = [];
  const uper = [];

  console.log("All imported files:", allFiles);

  for (const path in allFiles) {
    const fileName = path.split("/").pop();
    const fileInfo = { name: fileName, path: path }; // path가 여기서 중요

    if (path.includes("/j2735/")) j2735.push(fileInfo);
    else if (path.includes("/ksa/")) ksa.push(fileInfo);
    else if (path.includes("/uper/")) uper.push(fileInfo);
  }

  state.j2735Files = j2735;
  state.ksaFiles = ksa;
  state.uperFiles = uper;

  console.log("Loaded file lists:", {
    j2735: state.j2735Files,
    ksa: state.ksaFiles,
    uper: state.uperFiles,
  });
};

const handleFileSelect = async (filePath) => {
  console.log("선택된 파일:", filePath);

  const ext = filePath.split(".").pop().toLowerCase();
  const fileName = filePath.split("/").pop();

  try {
    // --- 핵심 수정 부분 ---
    // assets 폴더 내의 파일을 Vite가 인식할 수 있는 실제 경로로 변환
    const fileUrl = new URL(filePath, import.meta.url).href;
    const response = await fetch(fileUrl);

    if (!response.ok) throw new Error("파일을 찾을 수 없습니다.");

    if (ext === "uper") {
      const arrayBuffer = await response.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const hexString = Array.from(uint8Array)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      console.log("Sending hex to NestJS:", hexString);
    } else if (ext === "json") {
      const jsonData = await response.json();
      await mapStore.loadIntersectionData(jsonData, fileName);
    }
  } catch (error) {
    console.error("파일 처리 실패:", error);
  }
};

// json 리스트 가져오기
// const getMapList = () => {
//   state.mapList = Object.keys(mapModules).map((path) => ({
//     path: path,
//     name: path.split("/").pop(),
//   }));
// };

onMounted(async () => {
  try {
    loadFileList(); // 파일 목록 먼저 로드

    // DOM이 완전히 렌더링된 후 실행
    await nextTick();

    // getMapList();

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

.overlay-container {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 1000;

  display: flex;
  align-items: flex-start;
  gap: 20px;
  pointer-events: none;
}

.file-info {
  position: absolute !important;
  top: 10px !important;
  right: 500px !important;
  z-index: 1000;
  width: auto;
  min-width: 250px;

  /* 배경을 흰색 기반 80% 투명도로 설정 */
  background-color: rgba(255, 255, 255, 0.7) !important;
  /* 뒤 배경 블러 처리 (선택 사항: 고급스러운 느낌) */
  backdrop-filter: blur(4px);
  /* 테두리도 약간 투명하게 조절 가능 */
  border: 1px solid rgba(204, 204, 204, 0.5);
}

.file-json {
  position: absolute !important;
  top: 10px !important;
  right: 10px !important;
  left: auto !important;
}

.info-item {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.label {
  font-weight: bold;
  min-width: 140px;
}

/* 사이드바 스크롤바 숨기기 */
.v-navigation-drawer__content::-webkit-scrollbar {
  display: none !important;
  width: 0 !important;
}

.v-navigation-drawer__content {
  -ms-overflow-style: none !important;
  scrollbar-width: none !important;
}
</style>
