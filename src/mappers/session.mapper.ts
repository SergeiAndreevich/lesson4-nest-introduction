import {TypeSession, TypeSessionToFront} from "../types/session.types";

export function mapSessionToFront(session: TypeSession): TypeSessionToFront {
    return {
        ip: session.ip,
        title: session.device_name,
        lastActiveDate: session.last_activity.toISOString(),
        deviceId: session.device_id
    }
}