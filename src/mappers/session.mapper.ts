import {SessionDocument} from "../sessionLogic/securityDevices/schema/session.schema";
import {TypeSessionToFront} from "../types/session.types";

export function mapSessionToFront(session: SessionDocument): TypeSessionToFront {
    return {
        ip: session.ip,
        title: session.deviceName,
        lastActiveDate: session.lastActivity.toISOString(),
        deviceId: session.deviceId
    }
}