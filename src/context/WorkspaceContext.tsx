import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'

export interface TaskWorkflowNode {
  id: string;          // 예: 'photo-ledger'
  name: string;        // 예: '사진대지 PDF 작성기'
  status: 'completed' | 'active' | 'pending';
  url?: string;        // 실제 툴이 가동될 프론트 주소
}

export interface ConstructionTask {
  id: string;          // 예: 'concrete-pouring'
  name: string;        // 예: '콘크리트 타설'
  workflow: TaskWorkflowNode[];
}

export interface ExplorerFolder {
  id: string;          // 예: 'gongsa'
  name: string;        // 예: '공사 관리'
  tasks: ConstructionTask[];
}

interface WorkspaceContextType {
  selectedPath: string[]; // [대분류, 태스크]
  expandedFolders: string[]; // 펼쳐진 폴더 ID 리스트
  activeTask: ConstructionTask | null;
  activeStep: number;
  sharedData: Record<string, any>;
  toggleFolder: (folderId: string) => void;
  selectTask: (folderId: string, task: ConstructionTask) => void;
  selectStep: (stepIndex: number) => void;
  updateSharedData: (key: string, value: any) => void;
  completeStep: (stepIndex: number) => void;
  resetWorkspace: () => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider = ({ children }: { children: ReactNode }) => {
  const [selectedPath, setSelectedPath] = useState<string[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<string[]>([]);
  const [activeTask, setActiveTask] = useState<ConstructionTask | null>(null);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [sharedData, setSharedData] = useState<Record<string, any>>({});

  // 폴더 토글 (열기/닫기) - Progressive Disclosure
  const toggleFolder = (folderId: string) => {
    setExpandedFolders((prev) =>
      prev.includes(folderId)
        ? prev.filter((id) => id !== folderId)
        : [...prev, folderId]
    );
  };

  // 태스크 선택 (업무 진입)
  const selectTask = (folderId: string, task: ConstructionTask) => {
    setSelectedPath([folderId, task.name]);
    setActiveTask(task);
    setActiveStep(0); // 첫 번째 단말 노드(TBM 등)로 포커스
  };

  // 특정 워크플로우 단계 선택
  const selectStep = (stepIndex: number) => {
    if (activeTask && stepIndex >= 0 && stepIndex < activeTask.workflow.length) {
      setActiveStep(stepIndex);
    }
  };

  // 도구간 계승 공유 데이터 업데이트
  const updateSharedData = (key: string, value: any) => {
    setSharedData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // 특정 단계 완료 처리
  const completeStep = (stepIndex: number) => {
    if (!activeTask) return;
    const updatedWorkflow = activeTask.workflow.map((node, index) => {
      if (index === stepIndex) {
        return { ...node, status: 'completed' as const };
      }
      if (index === stepIndex + 1 && node.status === 'pending') {
        return { ...node, status: 'active' as const };
      }
      return node;
    });

    const updatedTask = {
      ...activeTask,
      workflow: updatedWorkflow,
    };
    setActiveTask(updatedTask);

    // 다음 단계가 있다면 자동으로 한 단계 전진
    if (stepIndex + 1 < activeTask.workflow.length) {
      setActiveStep(stepIndex + 1);
    }
  };

  const resetWorkspace = () => {
    setSelectedPath([]);
    setActiveTask(null);
    setActiveStep(0);
  };

  return (
    <WorkspaceContext.Provider
      value={{
        selectedPath,
        expandedFolders,
        activeTask,
        activeStep,
        sharedData,
        toggleFolder,
        selectTask,
        selectStep,
        updateSharedData,
        completeStep,
        resetWorkspace,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};
