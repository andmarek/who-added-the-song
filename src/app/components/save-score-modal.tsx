import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Button, FormControl, FormLabel, Input } from "@chakra-ui/react";
import { useRef } from "react";

interface SaveScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionScore: number;
  updateLeaderboardData: (score: number, name: string) => void;
}

function SaveScoreModal({ isOpen, onClose, sessionScore, updateLeaderboardData }: SaveScoreModalProps) {
  const nameRef = useRef<HTMLInputElement>(null);

  const handleSaveScore = () => {
    const name = nameRef.current?.value || "";
    updateLeaderboardData(sessionScore, name);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none">
      <div className="relative w-auto max-w-md mx-auto my-6">
        <div className="relative flex flex-col w-full bg-white border-0 rounded-lg shadow-lg outline-none focus:outline-none">
          <div className="flex items-start justify-between p-5 border-b border-solid border-gray-300 rounded-t">
            <h3 className="text-2xl font-semibold">
              Congrats! You scored {sessionScore}
            </h3>
            <button
              className="p-1 ml-auto bg-transparent border-0 text-black float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
              onClick={onClose}
            >
              <span className="bg-transparent text-black h-6 w-6 text-2xl block outline-none focus:outline-none">
                ×
              </span>
            </button>
          </div>
          <div className="relative p-6 flex-auto">
            <form onSubmit={(e) => { e.preventDefault(); handleSaveScore(); }}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                  Enter a name to save your score!
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="name"
                  type="text"
                  placeholder="Display Name"
                  ref={nameRef}
                  autoFocus
                />
              </div>
            </form>
          </div>
          <div className="flex items-center justify-end p-6 border-t border-solid border-gray-300 rounded-b">
            <button
              className="text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1"
              type="button"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              className="bg-blue-500 text-white active:bg-blue-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1"
              type="button"
              onClick={handleSaveScore}
            >
              Save Score
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SaveScoreModal;