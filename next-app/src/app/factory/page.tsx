'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import FactoryHUD from '@/features/factory/components/FactoryHUD';
import BoardroomModal from '@/features/factory/components/BoardroomModal';
import EntityDetailDrawer from '@/features/factory/components/EntityDetailDrawer';
import DepartmentSidebar from '@/features/factory/components/DepartmentSidebar';
import { DIVISIONS, DivisionConfig } from '@/features/factory/data/factoryData';

// Dynamically import Three.js scene with SSR disabled
const FactoryScene = dynamic(() => import('@/features/factory/3d/FactoryScene'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 text-slate-400 space-y-3">
      <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      <p className="text-sm font-semibold tracking-wide text-slate-300">
        Initializing Sharma Industries 3D Factory Diorama...
      </p>
      <p className="text-xs text-slate-500">
        Loading 7 Executive Cabins, AI Boardroom, & Swatch Plant Floor
      </p>
    </div>
  )
});

export default function FactoryPage() {
  const [meetingActive, setMeetingActive] = useState(false);
  const [activeSpeechIndex, setActiveSpeechIndex] = useState(0);
  const [selectedEntity, setSelectedEntity] = useState<{ type: 'division' | 'pillar'; data: any } | null>(null);
  const [selectedDivisionId, setSelectedDivisionId] = useState<string | null>(null);
  const [isBoardroomModalOpen, setIsBoardroomModalOpen] = useState(false);
  const [cameraPreset, setCameraPreset] = useState<'plant' | 'boardroom' | 'cabins' | 'production' | 'warehouse'>('plant');

  // Auto round-robin speaker cycle during active board meeting
  useEffect(() => {
    if (!meetingActive) return;
    const interval = setInterval(() => {
      setActiveSpeechIndex((prev) => (prev + 1) % DIVISIONS.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [meetingActive]);

  const handleToggleMeeting = () => {
    if (!meetingActive) {
      setMeetingActive(true);
      setCameraPreset('boardroom');
      setIsBoardroomModalOpen(true);
    } else {
      setMeetingActive(false);
      setIsBoardroomModalOpen(false);
      setCameraPreset('plant');
    }
  };

  const handleSelectDivision = (div: DivisionConfig | null) => {
    if (div) {
      setSelectedDivisionId(div.id);
      setSelectedEntity({ type: 'division', data: div });
    } else {
      setSelectedDivisionId(null);
      setSelectedEntity(null);
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950">
      {/* 3D WebGL Canvas Layer — Full Background */}
      <FactoryScene
        meetingActive={meetingActive}
        activeSpeechIndex={activeSpeechIndex}
        selectedDivisionId={selectedDivisionId}
        onSelectEntity={(entity) => {
          setSelectedEntity(entity);
          if (entity.type === 'division') {
            setSelectedDivisionId(entity.data.id);
          }
        }}
        cameraPreset={cameraPreset}
      />

      {/* Top and Bottom Executive HUD */}
      <FactoryHUD
        meetingActive={meetingActive}
        onToggleMeeting={handleToggleMeeting}
        onSelectCamera={(preset) => {
          setCameraPreset(preset);
          if (preset === 'plant') {
            setSelectedDivisionId(null);
            setSelectedEntity(null);
          }
        }}
        activePreset={cameraPreset}
        selectedDivisionId={selectedDivisionId}
      />

      {/* LEFT: Master Executive Department Sidebar — with full intelligence dossier */}
      <DepartmentSidebar
        selectedDivisionId={selectedDivisionId}
        onSelectDivision={handleSelectDivision}
        meetingActive={meetingActive}
        activeSpeechIndex={activeSpeechIndex}
      />

      {/* RIGHT: Detail Drawer — only for pillar entities (lab, warehouse, etc.) */}
      {selectedEntity && selectedEntity.type === 'pillar' && (
        <EntityDetailDrawer
          entity={selectedEntity}
          onClose={() => setSelectedEntity(null)}
          onOpenMeeting={() => {
            setSelectedEntity(null);
            handleToggleMeeting();
          }}
        />
      )}

      {/* Boardroom Standup Modal & Debate Transcript */}
      <BoardroomModal
        isOpen={isBoardroomModalOpen}
        onClose={() => setIsBoardroomModalOpen(false)}
        activeSpeechIndex={activeSpeechIndex}
        onSelectSpeaker={(idx) => setActiveSpeechIndex(idx)}
      />
    </div>
  );
}
