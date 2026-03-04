export const EAS_CONTRACT_ADDRESS = '0xaEF4103A04090071165F78D45D83A0C0782c2B2a';
export const SCHEMA_REGISTRY_ADDRESS = '0x0a7E2Ff54e76B8E6659aedc9103FB21c038050D0';

export const SCHEMA_EVALUATION =
  'address receiver, uint16 rubroId, uint8 interactionType, uint8 scoreService, uint8 scoreTreatment, uint8 role, bytes32 counterpartUID';

export const SCHEMA_PROXIMITY =
  'uint16 rubroA, uint16 rubroB, uint8 proximityScore, uint8 proposerLevel';

export const SCHEMA_VALIDATION = 'uint16 rubroId, bool approved, string reason';

// These get populated after deploying schemas (task 1.3)
export const SCHEMA_EVALUATION_UID = process.env.NEXT_PUBLIC_SCHEMA_EVALUATION_UID || '';
export const SCHEMA_PROXIMITY_UID = process.env.NEXT_PUBLIC_SCHEMA_PROXIMITY_UID || '';
export const SCHEMA_VALIDATION_UID = process.env.NEXT_PUBLIC_SCHEMA_VALIDATION_UID || '';
