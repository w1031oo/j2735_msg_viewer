import { reactive, ref } from "vue";
import { defineStore } from "pinia";
// mapbox
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

export const useMapStore = defineStore("map", () => {
  const state = reactive({
    map: null,
    isLoading: false,
    mapError: null,
    fileInfo: null,
    intersectionData: null,
    layers: {
      laneLines: "lane-lines",
      laneLabels: "lane-labels",
      lanePoints: "lane-points",
      refPoint: "ref-point",
    },
  });

  // 지도 초기화
  const initMap = (container, options = {}) => {
    const defaultOptions = {
      container,
      style: "mapbox://styles/mapbox/satellite-v9",
      center: [126.831695, 37.199408],
      zoom: 17,
    };

    const mapOptions = { ...defaultOptions, ...options };

    try {
      state.isLoading = true;

      // Mapbox 토큰 검증
      const token = import.meta.env.VITE_MAPBOX_TOKEN;
      if (!token) {
        throw new Error("Mapbox token is required");
      }

      // mapboxgl token
      mapboxgl.accessToken = token;

      // 지도 인스턴스 생성
      state.map = new mapboxgl.Map(mapOptions);

      // 지도 로드 완료 이벤트
      state.map.on("load", () => {
        state.isLoading = false;
      });

      // 지도 오류 이벤트
      state.map.on("error", (e) => {
        state.mapError = "Map error: " + e.error.message;
        state.isLoading = false;
      });
    } catch (error) {
      state.mapError = error.message;
      state.isLoading = false;
      throw error;
    }
  };

  // 위도/경도 변환 함수 (1/10,000,000도 단위에서 실제 도 단위로 변환)
  const convertCoordinates = (lat, long) => {
    return {
      lat: lat / 10000000,
      lng: long / 10000000,
    };
  };

  // 델타 노드에서 x, y 값을 추출하는 함수
  const extractDeltaValues = (deltaNode) => {
    for (const key in deltaNode) {
      if (
        deltaNode[key] &&
        deltaNode[key].x !== undefined &&
        deltaNode[key].y !== undefined
      ) {
        return {
          x: deltaNode[key].x,
          y: deltaNode[key].y,
        };
      }
    }
    return { x: 0, y: 0 };
  };

  // 차선 색상 할당 함수
  const getLaneColor = (isIngress, isEgress) => {
    if (isIngress) {
      return "#0088FF"; // 진입 차선은 파란색
    } else if (isEgress) {
      return "#FF5500"; // 진출 차선은 빨간색
    } else {
      return "#FFCC00"; // 기타 차선은 노란색
    }
  };

  // JSON 데이터 로드 및 처리
  const loadIntersectionData = async (jsonData, fileName) => {
    try {
      state.isLoading = true;

      // 지도 초기화 확인
      if (!state.map) {
        throw new Error("Map not initialized");
      }

      // 기존 레이어 제거
      cleanupLayers();

      // 데이터 저장
      state.intersectionData = jsonData;

      // 교차로 데이터 표시
      renderIntersectionData(fileName);
    } catch (error) {
      state.mapError = "Failed to load intersection data: " + error.message;
      console.error("Intersection data error:", error);
    } finally {
      state.isLoading = false;
    }
  };

  // 교차로 데이터 표시
  const renderIntersectionData = (fileName) => {
    try {
      if (!state.intersectionData || !state.map) return;

      // 교차로 데이터 추출
      const intersectionData =
        state.intersectionData.value || state.intersectionData;
      const mapData = intersectionData.MapData;
      if (
        !mapData ||
        !mapData.intersections ||
        mapData.intersections.length === 0
      ) {
        throw new Error("Invalid intersection data format");
      }

      const intersection = mapData.intersections[0];
      const rawRefPoint = intersection.refPoint;
      const refPoint = convertCoordinates(rawRefPoint.lat, rawRefPoint.long);

      // 파일 정보 입력
      state.fileInfo = {
        fileName: fileName,
        layerType: mapData.layerType,
        msgIssueRevision: mapData.msgIssueRevision,
        timestamp: mapData.timeStamp,
        id: intersection?.id?.id,
        region: intersection?.id?.region,
        laneSetCount: intersection?.laneSet?.length || 0,
        refPoint: { lat: refPoint.lat, lng: refPoint.lng },
        revision: intersection?.revision,
        speedLimits: convertSpeed(intersection?.speedLimits[0]?.speed),
      };
      console.log("File Info:", state.fileInfo);

      // 지도 중심 설정
      state.map.setCenter([refPoint.lng, refPoint.lat]);

      // 차선 데이터 처리
      processLanes(intersection.laneSet, refPoint);

      // 기준점 마커 추가
      addReferencePoint(refPoint, intersection.id);
    } catch (error) {
      state.mapError = "Failed to render intersection data: " + error.message;
      console.error("Render error:", error);
    }
  };

  const convertSpeed = (speed) => {
    if (speed == null || speed === 8191) return "N/A";
    return (speed * 0.02 * 3.6).toFixed(1) + " km/h";
  };

  // 기준점 마커 추가 함수 수정
  const addReferencePoint = (refPoint, id) => {
    // 기존 레이어 제거
    if (state.map.getLayer(state.layers.refPoint + "-label")) {
      state.map.removeLayer(state.layers.refPoint + "-label");
    }
    if (state.map.getLayer(state.layers.refPoint)) {
      state.map.removeLayer(state.layers.refPoint);
    }
    if (state.map.getSource(state.layers.refPoint)) {
      state.map.removeSource(state.layers.refPoint);
    }

    // 마커 이름 생성 (region_id 형식)
    const markerName = `${id.region}_${id.id}`;

    // 기준점 소스 추가
    state.map.addSource(state.layers.refPoint, {
      type: "geojson",
      data: {
        type: "Feature",
        properties: {
          name: markerName,
          description: `교차로 기준점 ID: ${id.id}, 지역: ${id.region}`,
        },
        geometry: {
          type: "Point",
          coordinates: [refPoint.lng, refPoint.lat],
        },
      },
    });

    // 기준점 원형 마커 레이어 추가 (circle 타입)
    state.map.addLayer({
      id: state.layers.refPoint,
      type: "circle",
      source: state.layers.refPoint,
      paint: {
        "circle-radius": 6,
        "circle-color": "#FFFFFF",
        "circle-stroke-width": 3,
        "circle-stroke-color": "#000000",
      },
    });

    // 기준점 레이블을 위한 별도의 symbol 레이어 추가
    state.map.addLayer({
      id: state.layers.refPoint + "-label",
      type: "symbol", // symbol 타입은 텍스트 표시 가능
      source: state.layers.refPoint,
      layout: {
        "text-field": ["get", "name"],
        "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
        "text-size": 15,
        "text-offset": [0, 1.5],
        "text-anchor": "center",
      },
      paint: {
        "text-color": "#FFFFFF",
        "text-halo-color": "#000000",
        "text-halo-width": 2,
      },
    });

    // 기준점 클릭 이벤트
    state.map.on("click", state.layers.refPoint, (e) => {
      const coordinates = e.features[0].geometry.coordinates.slice();
      const description = e.features[0].properties.description;

      new mapboxgl.Popup()
        .setLngLat(coordinates)
        .setHTML(description)
        .addTo(state.map);
    });
  };

  // 차선 데이터 처리
  const processLanes = (laneSet, refPoint) => {
    if (!laneSet || laneSet.length === 0) return;

    // GeoJSON 피처 배열 생성
    const laneFeatures = [];
    const pointFeatures = [];

    // 각 차선 처리
    laneSet.forEach((lane) => {
      try {
        const isIngress = lane.hasOwnProperty("ingressApproach");
        const isEgress = lane.hasOwnProperty("egressApproach");
        const laneType =
          getLaneTypeDescription(
            lane.laneAttributes?.laneType?.vehicle?.value
          ) || "unknown";
        const laneColor = getLaneColor(isIngress, isEgress);

        let coordinates = [];

        // 노드리스트가 직접 정의된 경우
        if (lane.nodeList && lane.nodeList.nodes) {
          coordinates = processDirectNodes(lane.nodeList.nodes, refPoint);
        }
        // 참조 차선을 사용하는 경우
        else if (
          lane.nodeList &&
          lane.nodeList.computed &&
          lane.nodeList.computed.referenceLaneId
        ) {
          coordinates = processComputedNodes(lane, laneSet, refPoint);
        }

        // 좌표가 충분하면 GeoJSON Feature 추가
        if (coordinates.length > 1) {
          // 라인 피쳐
          laneFeatures.push({
            type: "Feature",
            properties: {
              id: lane.laneID,
              name: lane.name || "",
              laneType: laneType,
              isIngress: isIngress,
              isEgress: isEgress,
              color: laneColor,
              maneuvers: lane.maneuvers || "unknown",
              description: `차선 ID: ${lane.laneID}, 이름: ${
                lane.name || "없음"
              }, 타입: ${laneType}`,
            },
            geometry: {
              type: "LineString",
              coordinates: coordinates,
            },
          });
          // 포인트 피쳐
          coordinates.forEach((coord, index) => {
            pointFeatures.push({
              type: "Feature",
              properties: {
                laneID: lane.laneID,
                laneName: lane.name || "",
                pointIndex: index,
                color: laneColor,
                description: `차선 ID: ${lane.laneID} - Point [${index}]`,
              },
              geometry: {
                type: "Point",
                coordinates: coord,
              },
            });
          });
        }
      } catch (laneError) {
        console.warn(`차선 ID ${lane.laneID} 처리 중 오류:`, laneError);
      }
    });

    // 레이어 추가
    addLaneLayers(laneFeatures, pointFeatures);
  };

  const getLaneTypeDescription = (vehicle) => {
    const value = parseInt(vehicle, 16); // 16진수 변환

    const types = [];
    if (value & 0x01) types.push("일반차량");
    if (value & 0x02) types.push("택시");
    if (value & 0x04) types.push("버스");
    if (value & 0x08) types.push("긴급차량");
    if (value & 0x10) types.push("다인승");
    if (value & 0x20) types.push("화물차");

    const type = types.length > 0 ? types.join(", ") : "일반차선";

    return type;
  };

  // 직접 정의된 노드 처리
  const processDirectNodes = (nodes, refPoint) => {
    if (!nodes || nodes.length === 0) return [];

    const coordinates = [];
    let currentX = 0; // 누적 X
    let currentY = 0; // 누적 Y

    // 각 노드에 대해 상대 좌표 계산
    nodes.forEach((node) => {
      const delta = extractDeltaValues(node.delta);

      // 누적 (항상 수행)
      currentX += delta.x;
      currentY += delta.y;

      // 속성이 없는 (0,0) 노드만 스킵
      if (delta.x === 0 && delta.y === 0 && !node.attributes) return;

      // 좌표 변환
      const latOffset = currentY / 100 / 111320;
      const lngOffset =
        currentX / 100 / (111320 * Math.cos((refPoint.lat * Math.PI) / 180));

      coordinates.push([refPoint.lng + lngOffset, refPoint.lat + latOffset]);
    });

    return coordinates;
  };

  // 참조 차선을 사용하는 노드 처리
  const processComputedNodes = (lane, laneSet, refPoint) => {
    const refLaneId = lane.nodeList.computed.referenceLaneId;
    const offsetX = lane.nodeList.computed.offsetXaxis?.small || 0;
    const offsetY = lane.nodeList.computed.offsetYaxis?.small || 0;

    const refLane = laneSet.find((l) => l.laneID === refLaneId);
    if (!refLane?.nodeList?.nodes) return [];

    const coordinates = [];
    let currentX = 0;
    let currentY = 0;

    refLane.nodeList.nodes.forEach((node) => {
      const delta = extractDeltaValues(node.delta);

      currentX += delta.x;
      currentY += delta.y;

      // delta가 (0,0)이고 속성도 없으면 스킵
      if (delta.x === 0 && delta.y === 0 && !node.attributes) {
        return;
      }

      // offset은 최종 좌표에 한 번만 적용
      const finalX = currentX + offsetX;
      const finalY = currentY + offsetY;

      const latOffset = finalY / 100 / 111320;
      const lngOffset =
        finalX / 100 / (111320 * Math.cos((refPoint.lat * Math.PI) / 180));

      coordinates.push([refPoint.lng + lngOffset, refPoint.lat + latOffset]);
    });

    return coordinates;
  };

  // 차선 레이어 추가
  const addLaneLayers = (laneFeatures, pointFeatures) => {
    // 기존 레이어가 있으면 제거
    if (state.map.getSource(state.layers.laneLines)) {
      state.map.removeLayer(state.layers.laneLabels);
      state.map.removeLayer(state.layers.laneLines);
      state.map.removeLayer(state.layers.lanePoints);
      state.map.removeSource(state.layers.laneLines);
      state.map.removeSource(state.layers.lanePoints);
    }

    // GeoJSON 소스 추가
    state.map.addSource(state.layers.laneLines, {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: laneFeatures,
      },
      generateId: true,
    });

    // 포인트 소스 추가
    state.map.addSource(state.layers.lanePoints, {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: pointFeatures,
      },
      generateId: true,
    });

    // 차선 레이어 추가
    state.map.addLayer({
      id: state.layers.laneLines,
      type: "line",
      source: state.layers.laneLines,
      layout: {
        "line-join": "round",
        "line-cap": "round",
      },
      paint: {
        // feature-state에 따라 색상 변경
        "line-color": [
          "case",
          ["boolean", ["feature-state", "hover"], false],
          "#FFFFFF", // hover 시 하얀색
          ["get", "color"], // 기본 색상
        ],
        "line-width": 4,
        "line-opacity": 0.8,
      },
    });

    // 포인트 레이어 추가
    state.map.addLayer({
      id: state.layers.lanePoints,
      type: "circle",
      source: state.layers.lanePoints,
      paint: {
        // feature-state에 따라 radius 변경
        "circle-radius": [
          "case",
          ["boolean", ["feature-state", "hover"], false],
          8, // hover 시
          4, // 기본
        ],
        "circle-color": ["get", "color"],
        "circle-stroke-width": [
          "case",
          ["boolean", ["feature-state", "hover"], false],
          2, // hover 시
          1, // 기본
        ],
        "circle-stroke-color": "#FFFFFF",
      },
    });

    // 차선 라벨 레이어 추가
    state.map.addLayer({
      id: state.layers.laneLabels,
      type: "symbol",
      source: state.layers.laneLines,
      layout: {
        "text-field": ["get", "id"],
        "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
        "text-size": 14,
        "text-anchor": "center", // 선의 중간에 표시
        "symbol-placement": "point", // 시작점 배치
        "text-allow-overlap": false,
      },
      paint: {
        "text-color": "#FFFFFF", // 기본 색상
        "text-halo-color": [
          "case",
          ["boolean", ["feature-state", "hover"], false],
          "#ff0000", // hover 시 하얀색
          "#000000", // 기본 색상
        ],
        "text-halo-width": 2,
      },
    });

    // Popup 인스턴스 생성 (재사용)
    const popup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false,
    });

    // hover 상태 추적
    let hoveredLaneId = null;
    let hoveredPointId = null;

    // Lane hover 인터랙션
    state.map.addInteraction("lane-hover", {
      type: "mousemove",
      target: { layerId: state.layers.laneLines },
      handler: (e) => {
        state.map.getCanvas().style.cursor = "pointer";

        // 이전 hover 제거
        if (hoveredLaneId !== null) {
          state.map.setFeatureState(
            { source: state.layers.laneLines, id: hoveredLaneId },
            { hover: false }
          );
        }

        // 새 hover 설정
        hoveredLaneId = e.feature.id;
        state.map.setFeatureState(
          { source: state.layers.laneLines, id: hoveredLaneId },
          { hover: true }
        );

        popup
          .setLngLat(e.lngLat)
          .setHTML(e.feature.properties.description)
          .addTo(state.map);
      },
    });

    // Lane mouseleave
    state.map.on("mouseleave", state.layers.laneLines, () => {
      state.map.getCanvas().style.cursor = "";

      if (hoveredLaneId !== null) {
        state.map.setFeatureState(
          { source: state.layers.laneLines, id: hoveredLaneId },
          { hover: false }
        );
        hoveredLaneId = null;
      }

      popup.remove();
    });

    // Point hover 인터랙션
    state.map.addInteraction("point-hover", {
      type: "mousemove",
      target: { layerId: state.layers.lanePoints },
      handler: (e) => {
        state.map.getCanvas().style.cursor = "pointer";

        // 이전 hover 제거
        if (hoveredPointId !== null) {
          state.map.setFeatureState(
            { source: state.layers.lanePoints, id: hoveredPointId },
            { hover: false }
          );
        }

        // 새 hover 설정
        hoveredPointId = e.feature.id;
        state.map.setFeatureState(
          { source: state.layers.lanePoints, id: hoveredPointId },
          { hover: true }
        );

        popup
          .setLngLat(e.lngLat)
          .setHTML(e.feature.properties.description)
          .addTo(state.map);
      },
    });

    // Point mouseleave
    state.map.on("mouseleave", state.layers.lanePoints, () => {
      state.map.getCanvas().style.cursor = "";

      if (hoveredPointId !== null) {
        state.map.setFeatureState(
          { source: state.layers.lanePoints, id: hoveredPointId },
          { hover: false }
        );
        hoveredPointId = null;
      }

      popup.remove();
    });
  };

  // 레이어 정리 함수
  const cleanupLayers = () => {
    if (!state.map) return;

    state.fileInfo = null;

    // 인터랙션 제거
    ["lane-hover", "point-hover"].forEach((id) => {
      try {
        state.map.removeInteraction(id);
      } catch (e) {
        // 존재하지 않으면 무시
      }
    });

    // 이벤트 제거
    state.map.off("mouseleave", state.layers.laneLines);
    state.map.off("mouseleave", state.layers.lanePoints);

    // 레이어 제거
    Object.values(state.layers).forEach((layerId) => {
      if (state.map.getLayer(layerId + "-label")) {
        state.map.removeLayer(layerId + "-label");
      }
      if (state.map.getLayer(layerId)) {
        state.map.removeLayer(layerId);
      }
    });

    // 소스 제거
    Object.values(state.layers).forEach((layerId) => {
      if (state.map.getSource(layerId)) {
        state.map.removeSource(layerId);
      }
    });
  };

  // 지도 정리
  const cleanUp = () => {
    if (!state.map) return;

    // 레이어 정리
    cleanupLayers();

    // 동적 layer 삭제
    const layersToRemove = [
      "link",
      "surfaceLine-single",
      "surfaceLine-double",
      "surfaceMark",
    ];

    // 1. 먼저 모든 레이어를 제거
    layersToRemove.forEach((layerId) => {
      try {
        if (state.map.getLayer(layerId)) {
          state.map.removeLayer(layerId);
        }
      } catch (error) {
        console.warn(`Failed to remove layer ${layerId}:`, error);
      }
    });

    // 2. 그 다음 모든 소스를 제거
    layersToRemove.forEach((layerId) => {
      try {
        if (state.map.getSource(layerId)) {
          state.map.removeSource(layerId);
        }
      } catch (error) {
        console.warn(`Failed to remove source ${layerId}:`, error);
      }
    });

    // map 삭제
    state.map.remove();
    state.map = null;

    // 상태 초기화
    state.isLoading = false;
    state.mapError = null;
    state.intersectionData = null;
  };

  return {
    state,
    initMap,
    loadIntersectionData,
    cleanupLayers,
    cleanUp,
  };
});
