import {TypeSession, TypeSessionToFront} from "../types/session.types";
import {Session} from "../sessionLogic/securityDevices/Entity/session.entity";

export function mapSessionToFront(session: TypeSession): TypeSessionToFront {
    return {
        ip: session.ip,
        title: session.device_name,
        lastActiveDate: session.last_activity.toISOString(),
        deviceId: session.device_id
    }
}

export function mapORMSessionToFront(session: Session): TypeSessionToFront {
    return {
        ip: session.ip,
        title: session.device_name,
        lastActiveDate: session.last_activity.toISOString(),
        deviceId: session.device_id
    }
}