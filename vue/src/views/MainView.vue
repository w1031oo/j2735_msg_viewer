<template>
  <div class="main-view-container">
    <v-overlay
      :model-value="mapStore.state.isLoading || asnIsPending"
      class="align-center justify-center text-h4"
    >
      <v-progress-circular
        :size="64"
        :width="6"
        indeterminate
      ></v-progress-circular>
    </v-overlay>

    <!-- Error Message -->
    <div v-if="mapStore.state.mapError || asnError" class="error-message">
      {{ mapStore.state.mapError || asnError }}
    </div>

    <v-layout style="height: 100vh">
      <v-navigation-drawer expand-on-hover permanent rail :width="320">
        <template v-slot:prepend>
          <v-list class="py-0" color="transparent">
            <v-list-item prepend-icon="mdi-file-outline">
              <div class="pa-2 d-flex">
                <v-btn
                  class="flex-grow-1"
                  @click="openFilePicker"
                  :loading="fileLoading"
                >
                  <template v-slot:prepend>
                    <v-icon icon="mdi-folder-search-outline"></v-icon>
                  </template>
                  MAP File
                </v-btn>
                <input
                  ref="fileInput"
                  type="file"
                  accept=".json,.uper"
                  style="display: none"
                  @change="handleFilePick"
                />
              </div>
            </v-list-item>
          </v-list>
          <v-divider></v-divider>
        </template>
        <!-- <template v-slot:prepend>
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
        </template> -->

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
                @click="handleFileSelect(file.name, file.path)"
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
                @click="handleFileSelect(file.name, file.path)"
              >
              </v-list-item>
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
                @click="handleFileSelect(file.name, file.path)"
              >
              </v-list-item>
            </v-list-group>
          </v-list-group>
        </v-list>

        <template v-slot:append>
          <v-divider></v-divider>
          <v-list class="py-0" color="transparent">
            <v-list-item prepend-icon="mdi-cog-outline">
              <div class="pa-2 d-flex ga-2">
                <!-- file info -->
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
                <!-- json tree -->
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
                <!-- clear -->
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
  </div>
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
import useAsnApi from "../composables/useAsnApi";
import { nullColor } from "vuetify/components/VColorPicker/util";
const { asnIsPending, asnError, decodeUper } = useAsnApi();

// const mapModules = import.meta.glob("../assets/j2735_msg/map/*.json");

const open = ref([]);
const fileInput = ref(null);
const fileLoading = ref(false);

const state = reactive({
  // mapList: [],
  j2735Files: [],
  ksaFiles: [],
  uperFiles: [],
});

const isShowState = reactive({
  fileInfo: true,
  jsonView: true,
});

const allFiles = import.meta.glob("/src/assets/map/**/*", {
  eager: true,
  query: "?url",
  import: "default",
});

// 파일 목록 가져오기
const loadFileList = () => {
  const j2735 = [];
  const ksa = [];
  const uper = [];

  for (const path in allFiles) {
    const fileName = path.split("/").pop();
    const actualUrl = allFiles[path];
    const fileInfo = { name: fileName, path: actualUrl }; // 실제 URL 사용

    if (path.includes("/j2735/")) j2735.push(fileInfo);
    else if (path.includes("/ksa/")) ksa.push(fileInfo);
    else if (path.includes("/uper/")) uper.push(fileInfo);
  }

  state.j2735Files = j2735;
  state.ksaFiles = ksa;
  state.uperFiles = uper;
};

const openFilePicker = () => {
  fileLoading.value = true;
  fileInput.value?.click();

  // 파일 탐색기 닫힌 후(선택 or 취소) 포커스가 돌아오면 로딩 해제
  const onFocus = () => {
    window.removeEventListener("focus", onFocus);
    // 파일 선택 시 handleFilePick이 먼저 처리되도록 딜레이
    setTimeout(() => {
      fileLoading.value = false;
    }, 200);
  };
  window.addEventListener("focus", onFocus);
};

// 첨부파일 선택 (파일 탐색기)
const handleFilePick = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  fileLoading.value = true;

  try {
    await processFileData(file.name, file);
  } catch (error) {
    console.error("파일 처리 실패:", error);
  } finally {
    fileLoading.value = false;
    event.target.value = "";
  }
};

// 사이드바 목록 선택 (assets 내부 파일)
const handleFileSelect = async (realFileName, filePath) => {
  const fileName = filePath.split("/").pop();

  try {
    const fileUrl = new URL(filePath, import.meta.url).href;
    const response = await fetch(fileUrl);

    if (!response.ok) throw new Error("파일을 찾을 수 없습니다.");

    await processFileData(realFileName, response);
  } catch (error) {
    console.error("파일 처리 실패:", error);
  }
};

// 공통 파일 처리 함수 (File 객체 또는 Response 둘 다 지원)
const processFileData = async (fileName, source) => {
  const ext = fileName.split(".").pop().toLowerCase();

  let jsonData = null;

  if (ext === "json") {
    jsonData =
      source instanceof Response
        ? await source.json()
        : JSON.parse(await source.text());
  } else if (ext === "uper") {
    const arrayBuffer = await source.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    const hexString = Array.from(uint8Array)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    const { jsonData: decodedJsonData, fileName: resFileName } =
      await decodeUper(hexString, fileName);

    jsonData = decodedJsonData;
  }

  await mapStore.loadIntersectionData(jsonData, fileName);
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

.file-info,
.file-json {
  pointer-events: auto;
}

.file-info {
  background-color: rgba(255, 255, 255, 0.7) !important;
  backdrop-filter: blur(4px);
  border: 1px solid rgba(204, 204, 204, 0.5);
  min-width: 250px;
}

.file-json {
  min-width: 300px;
  max-width: 600px;
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
