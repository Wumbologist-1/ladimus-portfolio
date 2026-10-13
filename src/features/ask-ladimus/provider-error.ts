// Only finite internal categories cross the provider boundary, never payloads.
export class AskProviderError extends Error {
  code:"provider_error"|"incomplete";
  constructor(code:"provider_error"|"incomplete") {super(code);this.code=code;}
}
