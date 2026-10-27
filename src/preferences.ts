export type Preferences = { name: string };
export type PreferencesSnapshot = { revision: string; value: Preferences };
export type Greeting = { message: string; time: string };

export const MAX_NAME_LENGTH = 80;

export function isPreferences(value: unknown): value is Preferences {
  return (
    value !== null &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    typeof (value as Preferences).name === 'string' &&
    (value as Preferences).name.length <= MAX_NAME_LENGTH
  );
}
