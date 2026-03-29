import { Transform } from 'class-transformer';

export function EmptyStringToUndefined() {
    return Transform(({ value }) => {
        if (value === '') return undefined;
        return value;
    });
}