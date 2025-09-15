import { useEffect, useState, useCallback } from 'react';
import { useGameStore } from './store/gameStore';
import { Grid } from './components/Grid/Grid';
import { PieceInventory } from './components/PieceSelector/PieceInventory';
import { SelectedPiecesQueue } from './components/PieceSelector/SelectedPiecesQueue';
import { AutoSolver } from './components/Solver/AutoSolver';
import { SpecialEffectsPanel } from './components/Statistics/SpecialEffectsPanel';
import { CardStatsPane } from './components/Statistics/CardStatsPane';
import { PieceEditor } from './components/PieceEditor/PieceEditor';
import { PieceDataForm } from './components/DataInput/PieceDataForm';

function App() {
  const { initializeGrid, addNewPieces, loadPieces, piecesLoaded, pieces, selectedPieceId } = useGameStore();
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isDataFormOpen, setIsDataFormOpen] = useState(false);
  const [selectedPieceIds, setSelectedPieceIds] = useState<string[]>([]);
  const [solverState, setSolverState] = useState({ isSearching: false, noSolutionFound: false, searchType: 'main' as 'main' | 'alternatives' });
  const [showCardStats, setShowCardStats] = useState(false);

  useEffect(() => {
    initializeGrid();
    loadPieces();
  }, [initializeGrid, loadPieces]);

  // Show card stats when a piece is selected from the grid
  useEffect(() => {
    if (selectedPieceId) {
      setShowCardStats(true);
    }
  }, [selectedPieceId]);

  const handleTogglePiece = (pieceId: string) => {
    setSelectedPieceIds(prev =>
      prev.includes(pieceId)
        ? prev.filter(id => id !== pieceId)
        : [...prev, pieceId]
    );
  };

  const handleSolutionFound = () => {
    // Solution is handled by the AutoSolver component
    // Could be used for additional tracking or display
  };

  const handleSolverStateChange = useCallback((state: { isSearching: boolean; noSolutionFound: boolean; searchType?: 'main' | 'alternatives' }) => {
    setSolverState({ ...state, searchType: state.searchType || 'main' });
  }, []);

  const handleSavePieceData = (newPieces: unknown[]) => {
    // Add the new pieces to the game store
    addNewPieces(newPieces as any[]);
    console.log('New pieces added to the game:', newPieces);

    // Also download as JSON file for backup
    const dataStr = JSON.stringify({ pieces: newPieces }, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `new-pieces-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    // Show confirmation to user
    alert(`Successfully added ${newPieces.length} new piece(s) to the game!`);
  };

  const handleSaveConfig = async () => {
    const config = {
      pieces: pieces.map(p => ({
        id: p.id,
        name: p.name,
        level: p.level,
        unlocked: p.unlocked,
        baseStats: p.baseStats
      })),
      timestamp: Date.now(),
      version: '1.0'
    };

    const dataStr = JSON.stringify(config, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `memsolver-config-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    alert('Configuration saved successfully!');
  };

  if (!piecesLoaded) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#050508', color: 'white', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '16px' }}>Loading Memory Cards...</div>
          <div style={{ width: '40px', height: '40px', border: '4px solid #374151', borderTop: '4px solid #fff35c', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <div style={{ minHeight: '100vh', backgroundColor: '#050508', color: 'white', padding: '16px', backgroundImage: 'radial-gradient(circle at 25% 25%, #1a1a2e 0%, #050508 50%)' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', padding: '16px', backgroundColor: '#0a0a0f', border: '1px solid #374151', borderRadius: '8px' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0, color: '#f8fafc', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>Memory Card Grid Solver</h1>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setIsEditorOpen(true)}
              style={{
                padding: '10px 16px',
                backgroundColor: '#374151',
                border: '1px solid #6b7280',
                borderRadius: '6px',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: '600',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#4b5563';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#374151';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              ⚙️ Settings
            </button>
            <button
              onClick={handleSaveConfig}
              style={{
                padding: '10px 16px',
                backgroundColor: '#0d9488',
                border: '1px solid #14b8a6',
                borderRadius: '6px',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: '600',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#0f766e';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#0d9488';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              💾 Save Config
            </button>
          </div>
        </div>


        {/* Selected Pieces Queue - Full Width */}
        <div style={{ marginTop: '24px' }}>
          <SelectedPiecesQueue
            selectedPieceIds={selectedPieceIds}
            onTogglePiece={handleTogglePiece}
            onViewPiece={(pieceId) => {
              const { selectPiece } = useGameStore.getState();
              selectPiece(pieceId);
              setShowCardStats(true);
            }}
            onClearGrid={() => {
              const { clearGrid } = useGameStore.getState();
              clearGrid();
            }}
          />
        </div>

        {/* Main Layout - Three Columns */}
        <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr 350px', gap: '24px', alignItems: 'start', marginTop: '24px' }}>

          {/* Left Column - Memory Cards */}
          <div>
            <PieceInventory
              selectedPieceIds={selectedPieceIds}
              onTogglePiece={handleTogglePiece}
              onViewPiece={(pieceId) => {
                const { selectPiece } = useGameStore.getState();
                selectPiece(pieceId);
                setShowCardStats(true);
              }}
            />
          </div>

          {/* Center Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center' }}>
            {/* Grid */}
            <div style={{ position: 'relative' }}>
              <Grid />

            {/* Solver Overlay */}
            {(solverState.isSearching || solverState.noSolutionFound) && (
              <div style={{
                position: 'absolute',
                top: '0',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(0, 0, 0, 0.85)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '8px',
                zIndex: 1000,
                backdropFilter: 'blur(4px)'
              }}>
                {solverState.isSearching ? (
                  <>
                    <div style={{
                      width: '60px',
                      height: '60px',
                      border: '4px solid #374151',
                      borderTop: '4px solid #448aff',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                      marginBottom: '16px'
                    }} />
                    <div style={{
                      fontSize: '1.25rem',
                      fontWeight: 'bold',
                      color: '#f8fafc',
                      marginBottom: '8px',
                      textAlign: 'center'
                    }}>
                      {solverState.searchType === 'alternatives' ? 'Finding Alternative Pieces...' : 'Searching for Solution...'}
                    </div>
                    <div style={{
                      fontSize: '0.875rem',
                      color: '#9ca3af',
                      textAlign: 'center',
                      maxWidth: '300px'
                    }}>
                      {solverState.searchType === 'alternatives'
                        ? 'Testing which additional pieces could fit with current solution'
                        : 'Finding optimal placement for all selected pieces'
                      }
                    </div>
                  </>
                ) : solverState.noSolutionFound ? (
                  <>
                    <div style={{
                      fontSize: '3rem',
                      marginBottom: '16px'
                    }}>
                      ❌
                    </div>
                    <div style={{
                      fontSize: '1.25rem',
                      fontWeight: 'bold',
                      color: '#ef4444',
                      marginBottom: '8px',
                      textAlign: 'center'
                    }}>
                      No Solutions Found
                    </div>
                    <div style={{
                      fontSize: '0.875rem',
                      color: '#9ca3af',
                      textAlign: 'center',
                      maxWidth: '300px',
                      lineHeight: '1.5'
                    }}>
                      All selected pieces cannot fit together on the grid. Try selecting fewer pieces or different combinations.
                    </div>
                    <button
                      onClick={() => setSolverState({ isSearching: false, noSolutionFound: false, searchType: 'main' })}
                      style={{
                        marginTop: '16px',
                        padding: '8px 16px',
                        backgroundColor: '#374151',
                        border: '1px solid #6b7280',
                        borderRadius: '6px',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#4b5563';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#374151';
                      }}
                    >
                      Close
                    </button>
                  </>
                ) : null}
              </div>
            )}
            </div>

            {/* Auto Solver - Below Grid, Same Width */}
            <div style={{ width: '500px' }}>
              <AutoSolver
                selectedPieceIds={selectedPieceIds}
                onSolutionFound={handleSolutionFound}
                onTogglePiece={handleTogglePiece}
                onSolverStateChange={handleSolverStateChange}
              />
            </div>
          </div>

          {/* Right Column - Card Stats or Special Effects */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {showCardStats ? (
              <>
                <CardStatsPane
                  selectedPieceId={selectedPieceId}
                  onClose={() => setShowCardStats(false)}
                />
                <div>
                  <SpecialEffectsPanel />
                </div>
              </>
            ) : (
              <div>
                <SpecialEffectsPanel />
              </div>
            )}
          </div>
        </div>



        {/* Instructions */}
        <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#0a0a0f', border: '1px solid #374151', borderRadius: '6px', textAlign: 'center', fontSize: '14px', color: '#9ca3af' }}>
          <p style={{ margin: 0 }}>Select memory cards from the inventory, then use the Auto Solver to find optimal grid placements.</p>
        </div>

        {/* Piece Editor Modal */}
        <PieceEditor
          isOpen={isEditorOpen}
          onClose={() => setIsEditorOpen(false)}
          onOpenDataForm={() => setIsDataFormOpen(true)}
        />

        {/* Piece Data Input Form */}
        <PieceDataForm
          isOpen={isDataFormOpen}
          onClose={() => setIsDataFormOpen(false)}
          onSaveData={handleSavePieceData}
        />
      </div>
      </div>
    </>
  );
}

export default App;