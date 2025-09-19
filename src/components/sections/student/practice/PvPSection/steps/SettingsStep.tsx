import { FC } from 'react';
import { PvPSettings } from '../PvPFlow';

interface SettingsStepProps {
  settings: PvPSettings;
  updateSettings: (field: string, value: any) => void;
  selectedGameMode: string;
  selectedOperation: string;
  onCreateRoom: () => void;
  loading: boolean;
  error: string | null;
  success: string | null;
  setError: (error: string | null) => void;
  setSuccess: (success: string | null) => void;
}

const SettingsStep: FC<SettingsStepProps> = ({
  settings,
  updateSettings,
  selectedGameMode,
  selectedOperation,
  onCreateRoom,
  loading,
  error,
  success,
  setError,
  setSuccess
}) => {
  return (
    <div className="space-y-6">
      {/* Selected Configuration Display */}
      <div className="bg-gradient-to-r from-gold/20 to-lightGold/20 rounded-xl p-4 border border-gold/30">
        <div className="text-center">
          <div className="text-gold font-bold text-lg mb-2">Selected Battle Configuration</div>
          <div className="flex flex-col tablet:flex-row justify-center items-center gap-4">
            <div className="bg-gold text-black px-3 py-1 rounded-full font-bold text-sm">
              {selectedOperation === 'addition' ? '➕ Addition & Subtraction' : 
               selectedOperation === 'multiplication' ? '✖️ Multiplication' : '➗ Division'}
            </div>
            <div className="bg-lightGold text-black px-3 py-1 rounded-full font-bold text-sm">
              {selectedGameMode === 'flashcards' ? '⚡ Flash Cards' :
               selectedGameMode === 'norush' ? '🐌 No Rush Mastery' :
               selectedGameMode === 'timeattack' ? '⏰ Time Attack' : '⚙️ Custom Challenge'}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4 tablet:space-y-6">
        {/* Practice Mode Settings */}
        <div className="border-t border-gold/30 pt-6 mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-gold font-bold text-lg">🎯 PvP Settings</h3>
            <button
              onClick={() => {
                // Reload practice mode settings
                const practiceSettings = localStorage.getItem('practiceModeSettings');
                if (practiceSettings) {
                  const parsedSettings = JSON.parse(practiceSettings);
                  // Update each setting individually
                  if (parsedSettings.numberOfDigitsLeft) updateSettings('numberOfDigitsLeft', parsedSettings.numberOfDigitsLeft);
                  if (parsedSettings.numberOfDigitsRight) updateSettings('numberOfDigitsRight', parsedSettings.numberOfDigitsRight);
                  if (parsedSettings.isZigzag !== undefined) updateSettings('isZigzag', parsedSettings.isZigzag);
                  if (parsedSettings.numberOfRows) updateSettings('numberOfRows', parsedSettings.numberOfRows);
                  if (parsedSettings.includeSubtraction !== undefined) updateSettings('includeSubtraction', parsedSettings.includeSubtraction);
                  if (parsedSettings.persistNumberOfDigits !== undefined) updateSettings('persistNumberOfDigits', parsedSettings.persistNumberOfDigits);
                  if (parsedSettings.includeDecimals !== undefined) updateSettings('includeDecimals', parsedSettings.includeDecimals);
                  if (parsedSettings.audioMode !== undefined) updateSettings('audioMode', parsedSettings.audioMode);
                  if (parsedSettings.audioPace) updateSettings('audioPace', parsedSettings.audioPace);
                  if (parsedSettings.showQuestion !== undefined) updateSettings('showQuestion', parsedSettings.showQuestion);
                  if (parsedSettings.operation) updateSettings('operation', parsedSettings.operation);
                  if (parsedSettings.game_mode) updateSettings('game_mode', parsedSettings.game_mode);
                  if (parsedSettings.numberOfDigitsLeft) updateSettings('number_of_digits', parsedSettings.numberOfDigitsLeft);
                  if (parsedSettings.flashcard_speed) updateSettings('time_per_question', parsedSettings.flashcard_speed / 1000);
                  else if (parsedSettings.time_per_question) updateSettings('time_per_question', parsedSettings.time_per_question);
                  if (parsedSettings.number_of_questions) updateSettings('number_of_questions', parsedSettings.number_of_questions);
                  if (parsedSettings.difficulty_level) updateSettings('difficulty_level', parsedSettings.difficulty_level);
                  setSuccess('✅ Settings synced with Practice Mode!');
                  setTimeout(() => setSuccess(null), 3000);
                } else {
                  setError('❌ No Practice Mode settings found. Please configure Practice Mode first.');
                  setTimeout(() => setError(null), 3000);
                }
              }}
              className="px-3 py-1 bg-gold text-black rounded-lg text-sm font-bold hover:bg-lightGold transition-colors"
            >
              🔄 Sync with Practice Mode
            </button>
          </div>
          
          {/* Practice Mode Settings Form */}
          <div className="flex flex-col items-center gap-4 bg-black p-8 border-2 border-boxGold rounded-lg">
            {/* Max Players */}
            <div className="tablet:gap-4 items-center gap-2 grid grid-cols-2 py-4 w-full">
              <p className="text-md text-left">👥 Max Players: </p>
              <input
                type="number"
                className="px-2 py-1 border border-grey rounded-md focus:outline-none w-full text-black text-center"
                value={Number(settings.max_players)}
                max={4}
                min={2}
                onChange={(e) => {
                  const v = parseInt(e.target.value, 10);
                  const clamped = isNaN(v) ? 2 : Math.max(2, Math.min(4, v));
                  updateSettings('max_players', clamped);
                }}
              />
            </div>

            {/* Number of Questions */}
            <div className="tablet:gap-4 items-center gap-2 grid grid-cols-2 py-4 w-full">
              <p className="text-md text-left">Number of Questions: </p>
              <input
                type="number"
                className="px-2 py-1 border border-grey rounded-md focus:outline-none w-full text-black text-center"
                value={Number(settings.number_of_questions)}
                max={1000}
                min={1}
                onChange={(e) => updateSettings('number_of_questions', parseInt(e.target.value, 10))}
              />
            </div>

            {/* Number of Digits Left */}
            <div className="tablet:gap-4 items-center gap-2 grid grid-cols-2 py-4 w-full">
              <p className="text-md text-left">
                {selectedOperation === 'division'
                  ? 'Number of Digits on Numerator: '
                  : selectedOperation === 'multiplication'
                    ? 'Number of Digits on First Operand: '
                    : 'Number of Digits: '}
              </p>
              <input
                type="number"
                className="px-2 py-1 border border-grey rounded-md focus:outline-none w-full text-black text-center"
                value={Number(settings.numberOfDigitsLeft)}
                max={15}
                min={1}
                onChange={(e) => updateSettings('numberOfDigitsLeft', parseInt(e.target.value, 10))}
              />
            </div>

            {/* Number of Digits Right - Only for multiplication and division */}
            {(selectedOperation === 'division' || selectedOperation === 'multiplication') && (
              <div className="tablet:gap-4 items-center gap-2 grid grid-cols-2 py-4 w-full">
                <p className="text-md text-left">
                  {selectedOperation === 'multiplication'
                    ? 'Number of Digits in Second Operand:'
                    : 'Number of Digits on Denominator: '}
                </p>
                <input
                  type="number"
                  className="px-2 py-1 border border-grey rounded-md focus:outline-none w-full text-black text-center"
                  value={Number(settings.numberOfDigitsRight)}
                  max={selectedOperation === 'division' ? 5 : 15}
                  min={1}
                  onChange={(e) => updateSettings('numberOfDigitsRight', parseInt(e.target.value, 10))}
                />
              </div>
            )}

            {/* Number of Rows - For addition, multiplication, division and flash cards */}
            {(selectedOperation === 'addition' || selectedOperation === 'multiplication' || selectedOperation === 'division' || selectedGameMode === 'flashcards') && (
              <div className="tablet:gap-4 items-center gap-2 grid grid-cols-2 py-4 w-full">
                <p className="text-md text-left">Number of Rows: </p>
                <div className="flex flex-col">
                  <input
                    type="text"
                    className="px-2 py-1 border border-grey rounded-md focus:outline-none w-full text-black text-center"
                    value={settings.numberOfRows.toString()}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Allow empty string for user to clear and type
                      if (value === '') {
                        updateSettings('numberOfRows', '');
                        return;
                      }
                      // Only allow digits
                      if (/^\d+$/.test(value)) {
                        const num = parseInt(value, 10);
                        if (num >= 1 && num <= 10) {
                          updateSettings('numberOfRows', num);
                        } else {
                          updateSettings('numberOfRows', value); // Keep the invalid input for user to see
                        }
                      }
                    }}
                    onBlur={(e) => {
                      const value = e.target.value;
                      if (value === '' || value === '1') {
                        updateSettings('numberOfRows', 2); // Reset to default
                      } else {
                        const num = parseInt(value, 10);
                        if (isNaN(num) || num < 2) {
                          updateSettings('numberOfRows', 2); // Reset to default
                        } else if (num > 10) {
                          updateSettings('numberOfRows', 10); // Clamp to max
                        }
                      }
                    }}
                    placeholder="2-10"
                  />
                  {(settings.numberOfRows < 2 || settings.numberOfRows === 1) && (
                    <p className="text-red-400 text-xs mt-1">⚠️ Number of rows cannot be less than 2</p>
                  )}
                </div>
              </div>
            )}

            {/* Zig-Zag Pattern - Only for addition */}
            {selectedOperation === 'addition' && (
              <div className="tablet:gap-4 items-center gap-2 grid grid-cols-2 py-4 w-full">
                <p className="text-md text-left">Zig-Zag Pattern: </p>
                <input
                  type="checkbox"
                  className="bg-gold px-2 py-1 border rounded-md w-full h-4 text-black text-center accent-gold"
                  checked={settings.isZigzag}
                  onChange={(e) => updateSettings('isZigzag', e.target.checked)}
                />
              </div>
            )}

            {/* Include Subtraction - Only for addition */}
            {selectedOperation === 'addition' && (
              <div className="tablet:gap-4 items-center gap-2 grid grid-cols-2 py-4 w-full">
                <p className="text-md text-left">Include Subtraction: </p>
                <input
                  type="checkbox"
                  className="bg-gold px-2 py-1 border rounded-md w-full h-4 text-black text-center accent-gold"
                  checked={settings.includeSubtraction}
                  onChange={(e) => updateSettings('includeSubtraction', e.target.checked)}
                />
              </div>
            )}

            {/* Persist Number of Digits - Only for addition */}
            {selectedOperation === 'addition' && (
              <div className="tablet:gap-4 items-center gap-2 grid grid-cols-2 py-4 w-full">
                <p className="text-md text-left">Same number of digits in answer as question: </p>
                <input
                  type="checkbox"
                  className="bg-gold px-2 py-1 border rounded-md w-full h-4 text-black text-center accent-gold"
                  checked={settings.persistNumberOfDigits}
                  onChange={(e) => updateSettings('persistNumberOfDigits', e.target.checked)}
                />
              </div>
            )}

            {/* Include Decimals - Only for division */}
            {selectedOperation === 'division' && (
              <div className="tablet:gap-4 items-center gap-2 grid grid-cols-2 py-4 w-full">
                <p className="text-md text-left">Include Decimal:</p>
                <input
                  type="checkbox"
                  className="bg-gold px-2 py-1 border rounded-md w-full h-4 text-black text-center accent-gold"
                  checked={settings.includeDecimals}
                  onChange={(e) => updateSettings('includeDecimals', e.target.checked)}
                />
              </div>
            )}


            {/* Flash Card Speed - Only show for flashcards mode */}
            {selectedGameMode === 'flashcards' && (
              <div className="tablet:gap-4 items-center gap-2 grid grid-cols-2 py-4 w-full">
                <p className="text-md text-left">⚡ Flash Card Speed: </p>
                <div className="flex flex-col items-center">
                  <input
                    name="flashcardSpeed"
                    className="px-2 py-1 border border-grey rounded-md outline-none focus:outline-none w-full text-black text-center accent-gold"
                    id="flashcardSpeed"
                    type="range"
                    min={100}
                    max={5000}
                    value={settings.time_per_question * 1000} // Convert seconds to milliseconds
                    onChange={(e) => updateSettings('time_per_question', parseInt(e.target.value) / 1000)} // Convert milliseconds to seconds
                  />
                  <div className="tablet:gap-4 flex justify-center items-center gap-2">
                    <input
                      type="number"
                      className="tablet:w-40 py-1 border border-grey rounded-md focus:outline-none text-black text-center"
                      value={Number(settings.time_per_question * 1000)}
                      min={100}
                      max={5000}
                      onChange={(e) => updateSettings('time_per_question', parseInt(e.target.value) / 1000)}
                    />
                    <p className="flex-1 text-nowrap text-white">
                      ms ({settings.time_per_question * 1000 < 1500 ? 'Fast' : settings.time_per_question * 1000 > 2500 ? 'Slow' : 'Medium'})
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Audio Mode Settings */}
            <div className="tablet:gap-4 items-center gap-2 grid grid-cols-2 py-4 w-full">
              <div className="text-left">
                <p className="text-md text-gold font-bold">🔊 Audio Mode</p>
                <p className="text-xs text-white/60">Questions read aloud, you type answers</p>
              </div>
              <div className="flex justify-end">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.audioMode}
                    onChange={(e) => {
                      const newAudioMode = e.target.checked;
                      updateSettings('audioMode', newAudioMode);
                      // When audio mode is disabled, automatically show questions
                      if (!newAudioMode) {
                        updateSettings('showQuestion', true);
                      }
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-12 h-6 bg-grey peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gold/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold"></div>
                </label>
              </div>
            </div>

            {/* Speech Pace - Only show if audio mode is enabled */}
            {settings.audioMode && (
              <div className="tablet:gap-4 items-center gap-2 grid grid-cols-2 py-4 w-full">
                <p className="text-md text-left">🎵 Speech Pace: </p>
                <select
                  value={settings.audioPace}
                  onChange={(e) => updateSettings('audioPace', e.target.value)}
                  className="px-2 py-1 border border-grey rounded-md focus:outline-none w-full text-black text-center"
                >
                  <option value="slow">🐌 SLOW - Easy to Follow</option>
                  <option value="normal">👤 NORMAL - Natural Speed</option>
                  <option value="fast">⚡ FAST - Quick Challenge</option>
                  <option value="ultra">🚀 ULTRA - Lightning Speed</option>
                </select>
              </div>
            )}

            {/* Question Visibility - Only show if audio mode is enabled */}
            {settings.audioMode && (
              <div className="tablet:gap-4 items-center gap-2 grid grid-cols-2 py-4 w-full">
                <div className="text-left">
                  <p className="text-md text-gold font-bold">👁️ Question Visibility</p>
                  <p className="text-xs text-white/60">Toggle with 👁️ button during practice</p>
                </div>
                <div className="flex justify-end">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.showQuestion}
                      onChange={(e) => updateSettings('showQuestion', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-12 h-6 bg-grey peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gold/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold"></div>
                  </label>
                </div>
              </div>
            )}

            {/* Audio Mode Info - Only show if audio mode is enabled */}
            {settings.audioMode && (
              <div className="tablet:gap-4 items-center gap-2 grid grid-cols-1 py-2 w-full">
                <p className="text-xs text-white/60 text-center">🎧 Questions read aloud, you type answers. Toggle visibility with 👁️ button.</p>
              </div>
            )}

          </div>
        </div>

        {/* Create Room Button */}
        <button
          onClick={() => {
            if (settings.numberOfRows < 2) {
              setError('Number of rows cannot be less than 2. Please enter a value between 2-10.');
              return;
            }
            onCreateRoom();
          }}
          disabled={loading || settings.numberOfRows < 2}
          className={`w-full py-3 tablet:py-4 px-6 tablet:px-8 rounded-2xl font-black text-base tablet:text-lg transition-all duration-500 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
            loading || settings.numberOfRows < 2
              ? 'bg-gray-500 text-gray-300'
              : 'bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white shadow-2xl hover:shadow-green-400/50'
          }`}
        >
          {loading ? '🔄 Creating Room...' : settings.numberOfRows < 2 ? '⚠️ Fix rows (2-10)' : '🚀 Create Room'}
        </button>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="rounded-2xl p-4 text-red-200 text-center" style={{ backgroundColor: '#212124' }}>
          ❌ {error}
        </div>
      )}

      {success && (
        <div className="rounded-2xl p-4 text-green-200 text-center" style={{ backgroundColor: '#212124' }}>
          ✅ {success}
        </div>
      )}
    </div>
  );
};

export default SettingsStep;
