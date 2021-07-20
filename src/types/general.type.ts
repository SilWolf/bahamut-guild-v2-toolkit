export type TEvent = (
	eventName: string,
	payload: Record<string, unknown>
) => void
