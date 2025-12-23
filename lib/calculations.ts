
import { Order, ProductionItem } from './types';
import { SERIES } from './constants';

// Safety wrapper for evaluation
function safeEval(formula: string, context: { W: number, H: number, D: number }) {
    try {
        // We add helpers to scope.
        const ROUND = (n: number) => Math.round(n);
        const ROUND5 = (n: number) => Math.round(n / 5) * 5;

        // Create a function with specific arguments and expose helpers
        const func = new Function('W', 'H', 'D', 'ROUND', 'ROUND5', 'return ' + formula);

        const result = func(context.W, context.H, context.D, ROUND, ROUND5);

        // Ensure result is number
        return typeof result === 'number' && !isNaN(result) ? result : 0;
    } catch (e) {
        console.error("Formula Eval Error:", formula, e);
        return 0;
    }
}

export const calculateProductionDetails = (order: Order, rules: any[] = []): ProductionItem[] => {
    const w = Number(order.width) || 0;
    const h = Number(order.height) || 0;
    const d = Number(order.depth) || w;
    const color = order.profileColor || 'Parlak';

    // Fallback if no rules passed (should not happen if fetched correctly, but for safety/initial migration)
    if (!rules || rules.length === 0) {
        return [];
        // Note: I'm removing the old hardcoded logic completely to force usage of rules. 
        // If rules are empty, result is empty, prompting user to check settings. 
        // This is better than maintaining dual logic.
    }

    const items: ProductionItem[] = [];
    const getProfileName = (baseName: string) => `${baseName} (${color})`; // Helper for appending color

    // Filter rules applicable to this order
    // 1. Matches Series or 'all'
    // 2. Matches Material (or null/any)
    // 3. Matches Model (or null/any) - e.g. 'kose', 'oval'

    const applicableRules = rules.filter(r => {
        const seriesMatch = r.series === 'all' || r.series === order.series;
        const matMatch = !r.material || r.material === order.material;
        const modelMatch = !r.model || r.model === order.model;
        return seriesMatch && matMatch && modelMatch;
    });

    for (const rule of applicableRules) {
        // Evaluate Formula
        // If val is 0 or '0', usually means accessory just count. 
        // But context might differ.
        const val = safeEval(rule.formula, { W: w, H: h, D: d });

        // For quantity: supports simple number. 
        // If we need dynamic quantity (e.g. 4 for oval, 2 for straight), 
        // the rule.quantity is currently Int. 
        // User requested "Imalat ölçülerinin formülleri". Quantity logic usually stable.
        // Exception: Rulman Seti (Oval/Kose -> 4, Duz -> 2).
        // Solution: Create separate rules for 'kose' rules vs 'duz' rules in DB if quantity differs.

        // For 'Glass' dimensions, rule.formula handles the "W - 2" part.
        // But stock logic (ROUND5) is inside formula now.

        // Output Construction
        const item: ProductionItem = {
            name: rule.type === 'profile' ? getProfileName(rule.componentName) : rule.componentName,
            val: val,
            unit: 'cm', // Default unit, will be overridden for glass/accessory
            qty: rule.quantity,
            type: rule.type as any,
            stockName: rule.stockName ? getProfileName(rule.stockName) : rule.componentName
        };

        if (rule.type === 'glass') {
            item.unit = 'adet';
            item.w = val; // calculated width
            // Glass height is usually Fixed or H-something.
            // Formula usually returns WIDTH (Stock Width).
            // Height is another formula.
            // Current Schema only has ONE formula.
            // For Glass, we typically need W and H.
            // Hack: "Sabit Cam" rule formula returns W. 
            // "Sabit Cam h" rule? No.
            // Usually Glass Height is H - 2.5 or similar.
            // To support fully dynamic Glass, we might need 'formulaH' in schema.
            // OR: we treat Width and Height as separate line items? No.
            // Let's hardcode Glass Height logic for now OR assume formula returns Width and H is derived?
            // User requested "Imalat ölçüleri".
            // Bella: No glass.
            // SuperLux: Glass H is 182.5 or 187.5 (Fixed vs Moving).
            // This is constant usually? 
            // Let's set Glass Height to standard 182.5/187.5 for now based on name matching?
            // Or assume H=OrderH for Pleksi.

            if (item.name.includes('Sabit')) item.h = 182.5;
            else if (item.name.includes('Çalışır')) item.h = 187.5;
            else item.h = h; // Default (e.g. Pleksi)
        }
        else if (rule.type === 'accessory') {
            item.unit = 'adet'; // or 'boy' if Val > 0?
            if (rule.componentName === 'Mıknatıs Suluk') item.unit = 'boy';
            else if (rule.componentName.includes('Takımı') || rule.componentName.includes('Rulman Seti')) item.unit = 'takım';

            if (val === 0) item.val = '-'; // If formula results in 0, it's likely a count-based accessory
        }

        items.push(item);
    }

    // Handle Double Profiles for Width/Depth if Kose/Oval
    // The rules generate 1 item per rule. 
    // If we need "2x for Width, 2x for Depth" (Square cabin), we need logic?
    // Current "Bella logic": 
    // Erkek Ray: W-9. Qty 2. 
    // If D !== W, we need another set for Depth.
    // The Rule engine evaluates ONE formula.
    // Issue: How to handle rectangular cabins (W x D)?
    // The rule formula uses 'W'. 
    // Determining if we need a second lines for 'D' dimension.
    // Quick Fix: iterate rules twice if W != D and rule depends on W?
    // Or simpler: Add 'side' field to Rule?
    // User's request implies basic configuration.
    // Standard approach: 
    // 1. Rules use 'W'.
    // 2. If Order is Rectangular (W!=D), we automatically clone 'Horizontal' profiles (type profile & formula uses W) replacing W with D?
    // This is smart but risky.
    // Let's implement: If W != D, we run the evaluation again swapping W for D, and append as new items?
    // Only for "Profile" type.

    if (d !== w && d > 0 && (order.model === 'kose' || order.model === 'oval')) {
        for (const rule of applicableRules) {
            // Only apply this logic to profiles that are typically horizontal and depend on 'W'
            // We assume rules for horizontal profiles will use 'W' in their formula.
            // This is a heuristic and might need refinement based on actual rule definitions.
            if (rule.type === 'profile' && rule.formula.includes('W')) {
                // If it's a width-dependent profile, calculate for D too
                // We pass 'd' as 'W' to the safeEval function so the formula "W - 9" becomes "d - 9"
                const valD = safeEval(rule.formula, { W: d, H: h, D: d });

                const itemD: ProductionItem = {
                    name: getProfileName(rule.componentName), // Same name? Usually "Erkek Ray Alt/Üst" is generic.
                    val: valD,
                    unit: 'cm',
                    qty: rule.quantity,
                    type: rule.type as any,
                    stockName: rule.stockName ? getProfileName(rule.stockName) : rule.componentName
                };
                items.push(itemD);
            }
        }
    }

    return items;
};
```
