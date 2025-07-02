import { JwtPayload } from "./JwtPayload";

export type JwtPayloadWithRefreshToken = JwtPayload & { refreshToken: string }