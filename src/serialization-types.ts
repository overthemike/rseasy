export const TYPE_MARKER = {
  Date: 'Date',
  Map: 'Map',
  Set: 'Set',
  Symbol: 'Symbol',
  Function: 'Function',
  Error: 'Error',
  DOMElement: 'DOMElement',
  Class: 'Class'
} as const;

export type TypeMarker = typeof TYPE_MARKER[keyof typeof TYPE_MARKER];

export interface SerializedSpecialType {
  __type: TypeMarker;
  value: unknown;
  className?: string;
}