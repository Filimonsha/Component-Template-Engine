export type FoundRegexpHandler = (
    foundedDynamicReg: string,
    foundedMatch: string
) => void;

export class RegexpHandler {
    static handAllFoundRegexp(
        regexpWhichNeedToFound: RegExp,
        observeString: string,
        foundRegexpHandler: FoundRegexpHandler,
        splitAndJoin: boolean = true
    ) {
        let nextFoundMatchArray: RegExpExecArray | null = null;
        while ((nextFoundMatchArray = regexpWhichNeedToFound.exec(observeString))) {
            const foundedDynamicReg = splitAndJoin
                ? nextFoundMatchArray[1].split(" ").join("")
                : nextFoundMatchArray[1];
            const foundedMatch = nextFoundMatchArray[0];
            foundRegexpHandler(foundedDynamicReg, foundedMatch);
        }
    }
}
