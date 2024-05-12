// ---------------------------------------------------------------------------------------------------------------------
// Various Utils
// ---------------------------------------------------------------------------------------------------------------------

/**
 * Deep merge two objects. Modifies the target object.
 * @param target - The target object.
 * @param source - The source object.
 */
export function deepMerge<T, U>(target : T, source : U) : T & U
{
    const isObject = (obj : any) : obj is Record<string, unknown> => obj && typeof obj === 'object';

    if(!isObject(target) || !isObject(source))
    {
        return source as T & U;
    }

    Object.keys(source).forEach((key) =>
    {
        const targetValue = target[key as keyof T];
        const sourceValue = source[key as keyof U];

        if(Array.isArray(targetValue) && Array.isArray(sourceValue))
        {
            target[key as keyof T] = targetValue.concat(sourceValue) as any;
        }
        else if(isObject(targetValue) && isObject(sourceValue))
        {
            target[key as keyof T] = deepMerge({ ...targetValue }, sourceValue) as any;
        }
        else
        {
            target[key as keyof T] = sourceValue as any;
        }
    });

    return target as T & U;
}

// ---------------------------------------------------------------------------------------------------------------------
