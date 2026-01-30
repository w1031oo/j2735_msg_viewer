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
      <v-card
        v-if="mapStore.state.fileInfo && isShowState.jsonView"
        class="file-json"
      >
        <v-card-title class="bg-grey-lighten-3 d-flex align-center">
          <v-icon start>mdi-file-tree</v-icon>
          <span class="text-subtitle-1">Data Structure</span>
        </v-card-title>

        <v-divider></v-divider>

        <div class="tree-scroll-container">
          <v-treeview
            :items="treeData"
            :load-children="fetchChildren"
            item-title="name"
            item-value="id"
            item-children="children"
            density="compact"
            open-on-click
          >
          </v-treeview>
        </div>
      </v-card>
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
// Store
import { useMapStore } from "../stores/mapStore";
const mapStore = useMapStore();
// composables
// import { useSocket } from "../composables/useSocket";
// const { mapData, decodeMap } = useSocket();

const mapModules = import.meta.glob("../assets/j2735_msg/map/*.json");

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

const treeData = shallowRef([]); // 반응성 부하를 줄이기 위해 shallowRef 사용

watch(
  () => mapStore.state.intersectionData,
  (newData) => {
    if (newData) {
      // 최상위 루트만 먼저 생성 (매우 빠름)
      treeData.value = [transformToTree(newData, "Root")];
    }
  },
  { immediate: true }
);

// 1. 초기에는 1단계(Root 하위)만 변환합니다.
const transformToTree = (data, keyName = "root") => {
  const id = encodeURIComponent(
    keyName + Math.random().toString(36).slice(2, 7)
  );

  if (typeof data === "object" && data !== null) {
    const isArray = Array.isArray(data);
    const keys = isArray ? data : Object.keys(data);
    const hasChildren = keys.length > 0;

    // --- 제목 결정 로직 추가 ---
    let displayTitle = keyName;

    // 만약 부모가 배열이었고, 현재 데이터(아이템)가 객체라면 내부 ID 탐색
    if (keyName.startsWith("index: ") && !isArray) {
      // 우선순위에 따라 제목으로 쓸 키를 찾음
      const identifier = data.laneID || data.id || data.name;
      if (identifier !== undefined) {
        // 객체인 경우 식별자를 제목으로 사용 (예: "Lane: 32")
        displayTitle = identifier.toString();
      }
    }

    return {
      id,
      name: isArray ? `${displayTitle} [${data.length}]` : displayTitle,
      children: hasChildren ? [] : undefined,
      raw: data,
      isLeaf: !hasChildren,
    };
  }

  return { id, name: `${keyName}: ${data}`, isLeaf: true };
};

// 사용자가 노드를 클릭했을 때 하위 데이터를 동적으로 생성하는 함수
const fetchChildren = async (item) => {
  if (!item.raw || (item.children && item.children.length > 0)) return;

  const data = item.raw;
  let newChildren = [];

  if (Array.isArray(data)) {
    newChildren = data.map((val, idx) => {
      // 배열의 자식임을 알리는 접두어 유지 (위의 제목 로직에서 활용)
      return transformToTree(val, `index: ${idx}`);
    });
  } else {
    newChildren = Object.keys(data).map((key) =>
      transformToTree(data[key], key)
    );
  }

  item.children = newChildren;
  treeData.value = [...treeData.value];
};

// 파일 목록 가져오기
const loadFileList = async () => {
  try {
    const [j2735Res, ksaRes, uperRes] = await Promise.all([
      fetch("http://localhost:3301/asn/files/j2735"),
      fetch("http://localhost:3301/asn/files/ksa"),
      fetch("http://localhost:3301/asn/files/uper"),
    ]);

    state.j2735Files = await j2735Res.json();
    state.ksaFiles = await ksaRes.json();
    state.uperFiles = await uperRes.json();
  } catch (error) {
    console.error("Failed to load file list:", error);
  }
};

const handleFileSelect = async (filePath) => {
  console.log("선택된 파일:", filePath);

  const ext = filePath.split(".").pop().toLowerCase();
  const fileName = filePath.split("/").pop();

  // 파일 처리 로직
  if (ext === "uper") {
    // UPER 파일 처리
    try {
      // fetch로 파일 읽기
      const response = await fetch(filePath);
      const arrayBuffer = await response.arrayBuffer();

      // ArrayBuffer를 hex string으로 변환
      const uint8Array = new Uint8Array(arrayBuffer);
      const hexString = Array.from(uint8Array)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      console.log("Sending hex:", hexString);
      decodeMap(hexString, fileName);
    } catch (error) {
      console.error("Failed to decode UPER file:", error);
    }
  } else if (ext === "json") {
    // JSON 파일 처리
    try {
      // 리스트에서 content를 찾는 대신, filePath를 이용해 직접 fetch 합니다.
      const response = await fetch(filePath);

      if (!response.ok) {
        throw new Error(
          `파일을 불러오는데 실패했습니다: ${response.statusText}`
        );
      }

      // JSON 파일이므로 response.json()을 바로 사용하거나 text로 받아 파싱합니다.
      const jsonData = await response.json();

      console.log("로드된 JSON 데이터:", jsonData);

      // Store에 데이터 로드
      await mapStore.loadIntersectionData(jsonData, fileName);
    } catch (error) {
      console.error("Failed to load JSON file:", error);
    }
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
    await loadFileList(); // 파일 목록 먼저 로드

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

.file-info {
  position: absolute;
  left: 10px;
  top: 10px;
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

  width: 500px;
  height: calc(100vh - 20px) !important; /* 전체 높이 차지 */

  z-index: 1010;
  display: flex !important;
  flex-direction: column !important; /* 헤더와 바디를 세로로 배치 */
  overflow: hidden !important; /* 카드 자체의 스크롤은 막음 */

  /* 배경을 흰색 기반 80% 투명도로 설정 */
  background-color: rgba(255, 255, 255, 0.7) !important;
  /* 뒤 배경 블러 처리 (선택 사항: 고급스러운 느낌) */
  backdrop-filter: blur(4px);
  /* 테두리도 약간 투명하게 조절 가능 */
  border: 1px solid rgba(204, 204, 204, 0.5);
}

/* 제목 영역 고정 */
.v-card-title {
  flex-shrink: 0;
}

/* 트리 영역만 스크롤 발생 */
.tree-scroll-container {
  flex: 1 1 auto; /* 남은 모든 공간을 차지 */
  overflow-y: auto !important; /* 세로 스크롤 강제 */
  overflow-x: hidden;
  min-height: 0; /* Flex 자식의 높이 계산 오류 방지 (중요!) */
}

/* Vuetify 내부 기본 배경 강제 제거 */
.file-json .v-card__item,
.file-json .v-card-text,
.file-json .v-treeview,
.tree-scroll-container {
  background-color: transparent !important;
}

/* Treeview 내부 텍스트가 너무 길어 밖으로 나가는 것 방지 */
.v-treeview {
  width: 100%;
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
