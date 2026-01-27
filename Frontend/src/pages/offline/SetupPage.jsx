/**
 * SetupPage - Offline Mode Setup Wizard (Container)
 * 
 * 4-Step wizard for setting up a local multiplayer game:
 * Step 1: Configuration (digits, difficulty) - "Mission Briefing Console"
 * Step 2: Player 1 enters secret
 * Step 3: Handover screen (pass device)
 * Step 4: Player 2 enters secret
 * 
 * This is the CONTAINER component that handles all state/logic.
 * UI rendering is delegated to child components in src/components/setup/
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useOfflineGameStore from '../../store/useOfflineGameStore';

// Import presentation components
import { 
  ConfigStep, 
  SecretEntryStep, 
  HandoverStep 
} from '../../components/setup';

function SetupPage() {
  const navigate = useNavigate();
  
  // ─── STORE CONNECTION ───
  const { 
    setupStep, 
    config, 
    setStep, 
    setConfig, 
    setSecret,
    setDigits,
    startGame
  } = useOfflineGameStore();
  
  // ─── LOCAL STATE ───
  const [currentSecret, setCurrentSecret] = useState('');
  const [error, setError] = useState('');

  // ─── HANDLERS ───
  
  const handleBack = () => {
    if (setupStep === 1) {
      navigate('/home');
    } else if (setupStep === 2) {
      setStep(1);
      setCurrentSecret('');
    }
  };

  const handleConfigChange = (key, value) => {
    setConfig(key, value);
  };

  const handleP1Submit = () => {
    const isValid = currentSecret.length === config.digits && 
      new Set(currentSecret.split('')).size === config.digits;
    
    if (!isValid) {
      setError('Please enter unique digits');
      return;
    }
    
    setSecret(1, currentSecret);
    setCurrentSecret('');
    setError('');
    setStep(3);
  };

  const handleP2Submit = () => {
    const isValid = currentSecret.length === config.digits && 
      new Set(currentSecret.split('')).size === config.digits;
    
    if (!isValid) {
      setError('Please enter unique digits');
      return;
    }
    
    setSecret(2, currentSecret);
    setDigits(config.digits);
    
    const result = startGame();
    if (result.success) {
      navigate('/offline/game');
    } else {
      setError(result.error);
    }
  };

  const handleHandoverReady = () => {
    setStep(4);
    setCurrentSecret('');
    setError('');
  };

  // ─── RENDER BASED ON STEP ───

  // Step 1: Configuration
  if (setupStep === 1) {
    return (
      <ConfigStep
        config={config}
        onConfigChange={handleConfigChange}
        onBack={handleBack}
        onNext={() => setStep(2)}
      />
    );
  }

  // Step 2: Player 1 Secret Entry
  if (setupStep === 2) {
    return (
      <SecretEntryStep
        playerNumber={1}
        config={config}
        currentSecret={currentSecret}
        onSecretChange={setCurrentSecret}
        onSubmit={handleP1Submit}
        onBack={handleBack}
        error={error}
      />
    );
  }

  // Step 3: Handover Screen
  if (setupStep === 3) {
    return (
      <HandoverStep onReady={handleHandoverReady} />
    );
  }

  // Step 4: Player 2 Secret Entry
  if (setupStep === 4) {
    return (
      <SecretEntryStep
        playerNumber={2}
        config={config}
        currentSecret={currentSecret}
        onSecretChange={setCurrentSecret}
        onSubmit={handleP2Submit}
        onBack={() => {}} // No back for P2
        error={error}
      />
    );
  }

  return null;
}

export default SetupPage;
