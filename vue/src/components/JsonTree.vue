<template>
  <!-- <v-card class="json-card" outlined height="100%" width="100%"> -->
  <v-card class="json-card">
    <v-card-title class="bg-grey-lighten-3 d-flex align-center">
      <v-icon start>mdi-file-tree</v-icon>
      <span class="text-subtitle-1">Data Structure</span>
    </v-card-title>

    <v-divider></v-divider>

    <div class="tree-scroll-container">
      <v-treeview
        class="compact-tree"
        :items="treeData"
        :load-children="fetchChildren"
        item-title="name"
        item-value="id"
        item-children="children"
        density="compact"
        indent-lines="true"
        open-on-click
      >
        <template v-slot:title="{ item }">
          <span class="text-body-2">
            {{ item.name }}
          </span>
        </template>
      </v-treeview>
    </div>
  </v-card>
</template>

<script setup>
import { computed, reactive, ref, shallowRef, watch } from "vue";
import { useMapStore } from "../stores/mapStore";
const mapStore = useMapStore();

const jsonData = computed(() => {
  mapStore.state.intersectionData;
});

const treeData = shallowRef([]); // 반응성 부하를 줄이기 위해 shallowRef 사용

// 초기에는 Root 하위만 변환
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
</script>

<style>
.json-card {
  /* width: 500px; */
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

/* v-list-item 패딩 조절 */
.compact-tree .v-list-item {
  min-height: 28px !important;
  padding: 0 8px !important;
}

.compact-tree .v-list-item__content {
  padding: 4px 0 !important;
}
</style>
