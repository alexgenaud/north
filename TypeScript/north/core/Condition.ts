import { Mode } from "../Util";
import Machine from "../Machine";
import { Loadable, Func } from "../types";

export const Condition: Loadable = (ma: Machine): boolean => {
    const conditionIf: Func = function(m: Machine): void {
        const current = m.costack.peek();
        if (current === Mode.IGNORE || current === Mode.BLOCK) {
            m.costack.push(Mode.BLOCK);
        } else if (current === Mode.COMPILE) {
            m.costack.push(Mode.COMPILE);
        } else if (current === Mode.EXECUTE) {
            m.costack.push(m.opstack.pop() !== 0 ? Mode.EXECUTE : Mode.IGNORE);
        }
    }

    const conditionElse: Func = function(m: Machine): void {
        const current = m.costack.peek();
        if (current === Mode.IGNORE) {
            m.costack.toggle(Mode.EXECUTE);
        } else if (current === Mode.EXECUTE) {
            m.costack.toggle(Mode.IGNORE);
        }
    }

    const conditionThen: Func = function(m: Machine): void {
        if (m.costack.peek() === Mode.COMPILE) {
            throw new Error(
                "Executed condition must be from EXECUTE or IGNORE but not COMPILE mode"
            );
        }
        m.costack.pop(); // if EXECUTE else IGNORE else EXECUTE
    }

    const d = ma.dictionary;
    d.addCoreCondition("IF", conditionIf);
    d.addCoreCondition("ELSE", conditionElse);
    d.addCoreCondition("THEN", conditionThen);
    return true;
};
