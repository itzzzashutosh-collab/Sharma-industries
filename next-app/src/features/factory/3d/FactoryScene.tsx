'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { DIVISIONS, PLANT_PILLARS, DivisionConfig } from '../data/factoryData';
import {
  makeFloorPlate,
  makeExecutiveCabin,
  makeBoardroom,
  makeCeoSuite,
  makeMixingSilos,
  makeConveyorLine,
  makeChemistLab,
  makeWarehouseDock,
  makeWorkerAvatar,
  makeSelectionRing
} from './factoryBuilders';

interface FactorySceneProps {
  meetingActive: boolean;
  activeSpeechIndex: number;
  onSelectEntity: (entity: { type: 'division' | 'pillar'; data: any }) => void;
  cameraPreset: 'plant' | 'boardroom' | 'cabins' | 'production' | 'warehouse';
  selectedDivisionId?: string | null;
}

export default function FactoryScene({
  meetingActive,
  activeSpeechIndex,
  onSelectEntity,
  cameraPreset,
  selectedDivisionId
}: FactorySceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const avatarsRef = useRef<Map<string, { mesh: THREE.Group; cabinPos: THREE.Vector3; seatPos: THREE.Vector3 }>>(new Map());
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const targetLookAt = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const currentLookAt = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const targetZoom = useRef<number>(24);
  const currentZoom = useRef<number>(24);

  // Conveyor, Silos & Selection Highlight references
  const movingBagsRef = useRef<THREE.Group | null>(null);
  const agitatorsRef = useRef<THREE.Mesh[]>([]);
  const selectionRingRef = useRef<THREE.Group | null>(null);
  const labWorkerRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#070b14');
    scene.fog = new THREE.FogExp2('#070b14', 0.0035);

    // 2. Camera Setup (Orthographic Isometric View)
    const aspect = container.clientWidth / container.clientHeight;
    const frustumSize = 46;
    const camera = new THREE.OrthographicCamera(
      (-frustumSize * aspect) / 2,
      (frustumSize * aspect) / 2,
      frustumSize / 2,
      -frustumSize / 2,
      -200,
      500
    );
    cameraRef.current = camera;

    // Standard Isometric Vector (45 deg yaw, ~35.26 deg pitch)
    const isoDir = new THREE.Vector3(1, 0.88, 1).normalize();
    const camDist = 125;
    camera.position.copy(isoDir.clone().multiplyScalar(camDist));
    camera.lookAt(0, 0, 0);

    // 3. WebGL Renderer Setup
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // 4. Industrial Studio Lighting
    const ambientLight = new THREE.AmbientLight('#e2e8f0', 1.35);
    scene.add(ambientLight);

    const mainSun = new THREE.DirectionalLight('#ffffff', 1.9);
    mainSun.position.set(60, 95, 45);
    scene.add(mainSun);

    const blueFill = new THREE.DirectionalLight('#38bdf8', 0.65);
    blueFill.position.set(-50, 45, -50);
    scene.add(blueFill);

    const warmFill = new THREE.DirectionalLight('#fef3c7', 0.6);
    warmFill.position.set(-40, 35, 80);
    scene.add(warmFill);

    // 5. Build Factory World
    const floor = makeFloorPlate();
    scene.add(floor);

    // 7 Executive Cabins
    DIVISIONS.forEach((div) => {
      const cabinMesh = makeExecutiveCabin(div);
      scene.add(cabinMesh);
    });

    // Central AI Boardroom
    const boardroom = makeBoardroom();
    scene.add(boardroom);

    // CEO Command Suite
    const ceoSuite = makeCeoSuite();
    scene.add(ceoSuite);

    // Mixing Silos
    const silos = makeMixingSilos();
    scene.add(silos);
    silos.traverse((obj) => {
      if (obj.name === 'agitator_shaft' && obj instanceof THREE.Mesh) {
        agitatorsRef.current.push(obj);
      }
    });

    // Conveyor Line
    const conveyor = makeConveyorLine();
    scene.add(conveyor);
    conveyor.traverse((obj) => {
      if (obj.name === 'moving_bags' && obj instanceof THREE.Group) {
        movingBagsRef.current = obj;
      }
    });

    // Chemist Lab
    const chemistLab = makeChemistLab();
    scene.add(chemistLab);

    // Warehouse Dock
    const warehouseDock = makeWarehouseDock();
    scene.add(warehouseDock);

    // Selection Highlight Ring
    const selectionRing = makeSelectionRing('#38bdf8');
    selectionRing.visible = false;
    scene.add(selectionRing);
    selectionRingRef.current = selectionRing;

    // 6. Spawn 7 Division Leaders (Seated behind desk battlestation)
    DIVISIONS.forEach((div) => {
      const avatar = makeWorkerAvatar(
        div.lead,
        div.shortName,
        div.avatarSpecs.suitColor,
        div.avatarSpecs.shirtColor,
        div.avatarSpecs.hairColor,
        true, // isSeated
        div.id
      );

      // In cabin: avatar hips sit on the chair cushion at y = 1.28, z = -2.6 in cabin space
      const cabinPos = new THREE.Vector3(
        div.cabinPos[0],
        div.cabinPos[1] + 1.28,
        div.cabinPos[2] - 2.6
      );

      // In boardroom: avatar sits in conference chair
      const seatPos = new THREE.Vector3(
        div.boardroomSeatPos[0],
        1.28,
        div.boardroomSeatPos[2] + 6
      );

      avatar.position.copy(cabinPos);
      avatar.lookAt(cabinPos.x, cabinPos.y, cabinPos.z + 5); // Facing forward towards desk & dual monitors
      scene.add(avatar);

      avatarsRef.current.set(div.id, {
        mesh: avatar,
        cabinPos,
        seatPos
      });
    });

    // 7. Spawn On-Ground Factory Workers & Leadership
    // Shahrukh bhai in Chemist Lab
    const shahrukh = makeWorkerAvatar('Shahrukh bhai', 'Senior Chemist', '#f8fafc', '#0284c7', '#1e293b', true);
    shahrukh.position.set(14, 1.25, -29.2);
    shahrukh.lookAt(14, 1.25, -27);
    scene.add(shahrukh);
    labWorkerRef.current = shahrukh;

    // Om Prakash Saini in Warehouse
    const omPrakash = makeWorkerAvatar('Om Prakash Saini', 'Warehouse Helper', '#ea580c', '#f8fafc', '#1e293b', false);
    omPrakash.position.set(-4, 0.2, -40);
    omPrakash.lookAt(-4, 0.2, -35);
    scene.add(omPrakash);

    // Sonu Kumar at B2B Counter
    const sonu = makeWorkerAvatar('Sonu Kumar', 'B2B Distributor', '#4f46e5', '#f8fafc', '#0f172a', false);
    sonu.position.set(4, 0.2, -40);
    sonu.lookAt(4, 0.2, -35);
    scene.add(sonu);

    // Ashutosh Sharma (CEO) & Suresh Sharma (Founder) in CEO Suite overlooking the plant floor
    const ashutosh = makeWorkerAvatar('Ashutosh Sharma', 'CEO & Founder', '#0f172a', '#eab308', '#0f172a', true);
    ashutosh.position.set(-2.5, 1.35, -13.2);
    ashutosh.lookAt(-2.5, 1.35, 0); // Looking out across factory
    const suresh = makeWorkerAvatar('Suresh Kumar Sharma', 'Co-Founder', '#1e293b', '#38bdf8', '#cbd5e1', true);
    suresh.position.set(2.5, 1.35, -13.2);
    suresh.lookAt(2.5, 1.35, 0);
    scene.add(ashutosh, suresh);

    // 8. Mouse Orbit, Pan, and Zoom Controls
    let isDragging = false;
    let isRightDragging = false;
    let prevMouse = { x: 0, y: 0 };
    let spherical = { radius: 125, theta: Math.PI / 4, phi: Math.PI / 3.4 };

    const onMouseDown = (e: MouseEvent) => {
      if (e.button === 0) isDragging = true;
      if (e.button === 2) isRightDragging = true;
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - prevMouse.x;
      const dy = e.clientY - prevMouse.y;
      prevMouse = { x: e.clientX, y: e.clientY };

      if (isDragging) {
        spherical.theta -= dx * 0.006;
        spherical.phi = Math.max(0.25, Math.min(Math.PI / 2.2, spherical.phi + dy * 0.005));
      } else if (isRightDragging) {
        const rightVec = new THREE.Vector3(1, 0, -1).normalize().applyAxisAngle(new THREE.Vector3(0, 1, 0), spherical.theta - Math.PI / 4);
        targetLookAt.current.addScaledVector(rightVec, -dx * 0.15);
        targetLookAt.current.y += dy * 0.15;
      }
    };

    const onMouseUp = () => {
      isDragging = false;
      isRightDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      targetZoom.current = Math.max(12, Math.min(65, targetZoom.current - e.deltaY * 0.03));
    };

    // Raycaster for Click Interaction on Cabins and Pillars
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onClick = (e: MouseEvent) => {
      if (isDragging || isRightDragging) return;
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);

      if (intersects.length > 0) {
        let curr: THREE.Object3D | null = intersects[0].object;
        while (curr && curr !== scene) {
          if (curr.name.startsWith('cabin_')) {
            const divId = curr.name.replace('cabin_', '');
            const div = DIVISIONS.find((d) => d.id === divId);
            if (div) onSelectEntity({ type: 'division', data: div });
            return;
          }
          if (curr.name === 'chemist_lab') {
            onSelectEntity({ type: 'pillar', data: PLANT_PILLARS.chemistLab });
            return;
          }
          if (curr.name === 'warehouse_dock') {
            onSelectEntity({ type: 'pillar', data: PLANT_PILLARS.warehouseDock });
            return;
          }
          if (curr.name === 'bagging_conveyor') {
            onSelectEntity({ type: 'pillar', data: PLANT_PILLARS.baggingLine });
            return;
          }
          if (curr.name === 'boardroom') {
            onSelectEntity({ type: 'pillar', data: PLANT_PILLARS.boardroom });
            return;
          }
          if (curr.name === 'ceo_suite') {
            onSelectEntity({ type: 'pillar', data: PLANT_PILLARS.ceoSuite });
            return;
          }
          curr = curr.parent;
        }
      }
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    dom.addEventListener('wheel', onWheel, { passive: false });
    dom.addEventListener('click', onClick);
    dom.addEventListener('contextmenu', (e) => e.preventDefault());

    // 9. Animation & Render Loop with Active Worker Typing
    let animId = 0;
    const clock = new THREE.Clock();

    const renderLoop = () => {
      animId = requestAnimationFrame(renderLoop);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Smooth Camera Lerp
      currentLookAt.current.lerp(targetLookAt.current, 0.08);
      currentZoom.current += (targetZoom.current - currentZoom.current) * 0.08;

      // Update Camera Position from Spherical Coordinates
      const x = spherical.radius * Math.sin(spherical.phi) * Math.sin(spherical.theta);
      const y = spherical.radius * Math.cos(spherical.phi);
      const z = spherical.radius * Math.sin(spherical.phi) * Math.cos(spherical.theta);
      camera.position.set(currentLookAt.current.x + x, currentLookAt.current.y + y, currentLookAt.current.z + z);
      camera.lookAt(currentLookAt.current);
      camera.zoom = currentZoom.current / 24;
      camera.updateProjectionMatrix();

      // Rotate Silo Agitators
      agitatorsRef.current.forEach((shaft) => {
        shaft.rotation.y += delta * 2.8;
      });

      // Move Conveyor Bags
      if (movingBagsRef.current) {
        movingBagsRef.current.children.forEach((bag) => {
          bag.position.x -= delta * 3.5;
          if (bag.position.x < -7.5) {
            bag.position.x = 7.5;
          }
        });
      }

      // Selection Beacon Subtle Float & Rotate
      if (selectionRingRef.current && selectionRingRef.current.visible) {
        selectionRingRef.current.rotation.y += delta * 0.6;
      }

      // Animate Workers Working at Desk (typing hands, scanning head)
      avatarsRef.current.forEach(({ mesh }) => {
        if (!meetingActive && mesh.userData && mesh.userData.isSeated) {
          const { leftHand, rightHand, head, leftHandBaseY, rightHandBaseY, typingPhase } = mesh.userData;
          if (leftHand && rightHand) {
            // Alternating typing motion on keyboard
            leftHand.position.y = leftHandBaseY + Math.sin(elapsed * 12 + typingPhase) * 0.04;
            rightHand.position.y = rightHandBaseY + Math.cos(elapsed * 13 + typingPhase) * 0.04;
          }
          if (head) {
            // Turning head between primary and secondary monitor
            head.rotation.y = Math.sin(elapsed * 1.2 + typingPhase) * 0.22;
            head.rotation.x = 0.08 + Math.sin(elapsed * 2.5 + typingPhase) * 0.03;
          }
        }
      });

      // Shahrukh bhai QC testing motion
      if (labWorkerRef.current && labWorkerRef.current.userData) {
        const { head } = labWorkerRef.current.userData;
        if (head) {
          head.rotation.y = Math.sin(elapsed * 0.9) * 0.16;
          head.rotation.x = 0.1 + Math.sin(elapsed * 1.8) * 0.04;
        }
      }

      renderer.render(scene, camera);
    };

    renderLoop();

    // Resize Handler
    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      const a = w / h;
      camera.left = (-frustumSize * a) / 2;
      camera.right = (frustumSize * a) / 2;
      camera.top = frustumSize / 2;
      camera.bottom = -frustumSize / 2;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      dom.removeEventListener('wheel', onWheel);
      dom.removeEventListener('click', onClick);
      if (container.contains(dom)) {
        container.removeChild(dom);
      }
      renderer.dispose();
    };
  }, [onSelectEntity]);

  // Synchronize Camera when user selects a Division or Camera Preset
  useEffect(() => {
    if (selectedDivisionId && !meetingActive) {
      const div = DIVISIONS.find((d) => d.id === selectedDivisionId);
      if (div) {
        targetLookAt.current.set(div.cameraFocus[0], div.cameraFocus[1], div.cameraFocus[2]);
        targetZoom.current = 48; // Close-up view of desk and person

        if (selectionRingRef.current) {
          selectionRingRef.current.position.set(div.cabinPos[0], div.cabinPos[1], div.cabinPos[2]);
          selectionRingRef.current.visible = true;
        }
      }
    } else {
      if (selectionRingRef.current) {
        selectionRingRef.current.visible = false;
      }
    }
  }, [selectedDivisionId, meetingActive]);

  // Handle Preset Camera Angles
  useEffect(() => {
    if (!cameraPreset) return;
    if (cameraPreset === 'plant') {
      targetLookAt.current.set(0, 0, 0);
      targetZoom.current = 24;
    } else if (cameraPreset === 'boardroom') {
      targetLookAt.current.set(0, 2, 6);
      targetZoom.current = 46;
    } else if (cameraPreset === 'cabins') {
      targetLookAt.current.set(-20, 2, 0);
      targetZoom.current = 36;
    } else if (cameraPreset === 'production') {
      targetLookAt.current.set(0, 2, -24);
      targetZoom.current = 38;
    } else if (cameraPreset === 'warehouse') {
      targetLookAt.current.set(0, 2, -40);
      targetZoom.current = 40;
    }
  }, [cameraPreset]);

  // Meeting Walking Transitions
  useEffect(() => {
    let animId = 0;
    const startTime = performance.now();
    const duration = 1600; // 1.6s smooth transition

    const updateWalk = () => {
      const now = performance.now();
      const progress = Math.min(1, (now - startTime) / duration);
      const ease = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;

      avatarsRef.current.forEach(({ mesh, cabinPos, seatPos }) => {
        const fromPos = meetingActive ? cabinPos : seatPos;
        const toPos = meetingActive ? seatPos : cabinPos;

        mesh.position.lerpVectors(fromPos, toPos, ease);

        if (progress < 1) {
          mesh.position.y = (meetingActive ? toPos.y : fromPos.y) + Math.sin(progress * Math.PI * 6) * 0.15;
          mesh.lookAt(toPos.x, mesh.position.y, toPos.z);
        } else {
          mesh.position.y = toPos.y;
          if (meetingActive) {
            mesh.lookAt(0, toPos.y, 6); // Facing boardroom conference table
          } else {
            mesh.lookAt(toPos.x, toPos.y, toPos.z + 5); // Facing forward in cabin
          }
        }
      });

      if (progress < 1) {
        animId = requestAnimationFrame(updateWalk);
      }
    };

    updateWalk();
    return () => cancelAnimationFrame(animId);
  }, [meetingActive]);

  return <div ref={containerRef} className="w-full h-full relative cursor-grab active:cursor-grabbing select-none" />;
}
