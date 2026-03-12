document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('inheritanceForm');
    const deceasedGenderSelect = document.getElementById('deceasedGender');
    const spouseGroup = document.getElementById('spouseGroup');
    const wifeInput = document.getElementById('wifeInput');
    const husbandInput = document.getElementById('husbandInput');
    const calculateBtn = document.getElementById('calculateInheritanceBtn');
    
    const treePlaceholder = document.getElementById('treePlaceholder');
    const visualGraph = document.getElementById('visualGraph');
    const treeNodes = document.getElementById('treeNodes');
    const treeLines = document.getElementById('treeLines');

    // Toggle Spouse options based on Deceased Gender
    deceasedGenderSelect.addEventListener('change', (e) => {
        if (e.target.value === 'male') {
            wifeInput.style.display = 'block';
            husbandInput.style.display = 'none';
            document.getElementById('husbandAlive').value = "0"; // Reset
        } else {
            wifeInput.style.display = 'none';
            husbandInput.style.display = 'block';
            document.getElementById('wivesCount').value = "0"; // Reset
        }
    });

    calculateBtn.addEventListener('click', () => {
        calculateAndRenderTree();
    });

    function calculateAndRenderTree() {
        // 1. Gather Inputs
        const gender = deceasedGenderSelect.value;
        const totalWealth = parseFloat(document.getElementById('totalWealth').value) || 0;
        
        const fatherAlive = document.getElementById('fatherAlive').value === "1";
        const motherAlive = document.getElementById('motherAlive').value === "1";
        const wivesCount = parseInt(document.getElementById('wivesCount').value) || 0;
        const husbandAlive = document.getElementById('husbandAlive').value === "1";
        const sonsCount = parseInt(document.getElementById('sonsCount').value) || 0;
        const daughtersCount = parseInt(document.getElementById('daughtersCount').value) || 0;

        const hasChildren = sonsCount > 0 || daughtersCount > 0;
        const hasMaleChildren = sonsCount > 0;

        // 2. Determine Shares (Simplified Islamic Inheritance Rules for Primary Heirs)
        let shares = []; // { name, relation, fraction, amount, reason }
        let totalFractionAssigned = 0;

        // Spouses
        if (gender === 'male' && wivesCount > 0) {
            const wifeShareFraction = hasChildren ? (1/8) : (1/4);
            totalFractionAssigned += wifeShareFraction;
            const singleWifeShare = wifeShareFraction / wivesCount;
            for(let i=1; i<=wivesCount; i++) {
                shares.push({
                    name: wivesCount > 1 ? `بیوہ ${i}` : 'بیوہ',
                    type: 'spouse',
                    fraction: singleWifeShare,
                    reason: hasChildren ? "اولاد کی موجودگی میں 1/8" : "اولاد نہ ہونے پر 1/4"
                });
            }
        } else if (gender === 'female' && husbandAlive) {
            const husbandShare = hasChildren ? (1/4) : (1/2);
            totalFractionAssigned += husbandShare;
            shares.push({
                name: 'شوہر',
                type: 'spouse',
                fraction: husbandShare,
                reason: hasChildren ? "اولاد کی موجودگی میں 1/4" : "اولاد نہ ہونے پر 1/2"
            });
        }

        // Parents
        let fatherShare = 0;
        let motherShare = 0;

        if (motherAlive) {
            // Mother gets 1/6 if children exist, else 1/3. 
            // (Ignoring Umariyyatani rule for simplicity in visual demo)
            motherShare = hasChildren ? (1/6) : (1/3);
            totalFractionAssigned += motherShare;
            shares.push({
                name: 'والدہ',
                type: 'parent',
                fraction: motherShare,
                reason: hasChildren ? "اولاد کی موجودگی میں 1/6" : "اولاد نہ ہونے پر 1/3"
            });
        }

        if (fatherAlive) {
            if (hasMaleChildren) {
                // Father gets just 1/6 
                fatherShare = 1/6;
                totalFractionAssigned += fatherShare;
                shares.push({
                    name: 'والد',
                    type: 'parent',
                    fraction: fatherShare,
                    reason: "مرد اولاد کی موجودگی میں صرف 1/6"
                });
            } else if (daughtersCount > 0) {
                // Father gets 1/6 as fixed, plus Asaba (Remainder) later
                fatherShare = 1/6;
                totalFractionAssigned += fatherShare;
                shares.push({
                    name: 'والد (حصہ دار)',
                    type: 'parent',
                    fraction: fatherShare,
                    reason: "بیٹی کی موجودگی میں 1/6 بطور ذوی الفروض"
                });
            } else {
                // Father is purely Asaba (takes all remainder) - handled in step 3
            }
        }

        // Daughters (if no sons)
        if (daughtersCount > 0 && sonsCount === 0) {
            const daughtersFraction = daughtersCount === 1 ? (1/2) : (2/3);
            totalFractionAssigned += daughtersFraction;
            const singleDaughterShare = daughtersFraction / daughtersCount;
            for(let i=1; i<=daughtersCount; i++) {
                shares.push({
                    name: daughtersCount > 1 ? `بیٹی ${i}` : 'بیٹی',
                    type: 'child',
                    fraction: singleDaughterShare,
                    reason: daughtersCount === 1 ? "اکیلی بیٹی کا 1/2" : "دو یا زیادہ بیٹیوں کا 2/3 میں شرکہ"
                });
            }
        }

        // 3. Handle Remainder (Asaba) or Aul (Oversubscribed)
        let remainder = 1 - totalFractionAssigned;

        if (remainder < 0) {
            // Aul (Decrease everyone proportionally)
            const aulFactor = 1 / totalFractionAssigned;
            shares.forEach(s => {
                s.fraction = s.fraction * aulFactor;
                s.reason += " (عول کی وجہ سے حصہ کم ہوا)";
            });
            remainder = 0;
        }

        if (remainder > 0.0001) { // Floating point safeguard
            if (sonsCount > 0) {
                // Remainder goes to Sons and Daughters (2:1 ratio)
                const totalParts = (sonsCount * 2) + daughtersCount;
                const partValue = remainder / totalParts;
                
                for(let i=1; i<=sonsCount; i++) {
                    shares.push({
                        name: sonsCount > 1 ? `بیٹا ${i}` : 'بیٹا',
                        type: 'child',
                        fraction: partValue * 2,
                        reason: "عصبہ (مرد کو عورت سے دوگنا حصہ)"
                    });
                }
                for(let i=1; i<=daughtersCount; i++) {
                    shares.push({
                        name: daughtersCount > 1 ? `بیٹی ${i}` : 'بیٹی',
                        type: 'child',
                        fraction: partValue,
                        reason: "عصبہ بالغیر (بھائی کے ساتھ)"
                    });
                }
            } else if (fatherAlive) {
                // Remainder goes to Father
                shares.push({
                    name: 'والد (عصبہ)',
                    type: 'parent',
                    fraction: remainder,
                    reason: "عصبہ کے طور پر بچا ہوا حصہ"
                });
            } else {
                // Radd (Return to non-spouse heirs). For simplicity, just labeling as Radd mapping.
                shares.push({
                    name: 'بقیہ مال (رَدّ)',
                    type: 'other',
                    fraction: remainder,
                    reason: "بقیہ مال جو ورثاء میں لوٹایا جائے گا (الرَدّ)"
                });
            }
        }

        // Calculate monetary amounts
        shares.forEach(s => {
            s.amount = totalWealth * s.fraction;
        });

        // 4. Render the Tree
        renderVisualTree(gender, shares, totalWealth);
    }

    function renderVisualTree(deceasedGender, shares, totalWealth) {
        treePlaceholder.style.display = 'none';
        visualGraph.style.visibility = 'visible';
        treeNodes.innerHTML = '';
        treeLines.innerHTML = '';

        // Node Dimensions
        const nodeWidth = 140;
        const nodeHeight = 80;
        const containerWidth = visualGraph.clientWidth;
        const containerHeight = visualGraph.clientHeight;

        // Create Deceased Node (Root)
        const rootX = containerWidth / 2 - nodeWidth / 2;
        const rootY = 40;
        
        const deceasedNode = document.createElement('div');
        deceasedNode.className = 'node-box deceased-node';
        deceasedNode.style.left = `${rootX}px`;
        deceasedNode.style.top = `${rootY}px`;
        deceasedNode.innerHTML = `
            <div class="node-title">متوفی (${deceasedGender === 'male' ? 'مرد' : 'عورت'})</div>
            ${totalWealth > 0 ? `<div class="node-amount">کل مال: ${totalWealth.toLocaleString()}</div>` : ''}
        `;
        treeNodes.appendChild(deceasedNode);

        // Group Shares by Type
        const parents = shares.filter(s => s.type === 'parent');
        const spouses = shares.filter(s => s.type === 'spouse');
        const children = shares.filter(s => s.type === 'child');
        const others = shares.filter(s => s.type === 'other');

        const levels = [
            parents,  // Level 1: Above/Side
            spouses,  // Level 1: Side
            children.concat(others) // Level 2: Below
        ];

        let drawnNodes = [];

        // Helper to draw node
        const drawNode = (share, index, total, levelY, isParent = false) => {
            // Calculate X based on index and total to center them
            const spacing = 180;
            const totalWidth = (total - 1) * spacing;
            const startX = (containerWidth / 2) - (totalWidth / 2) - (nodeWidth / 2);
            let finalX = startX + (index * spacing);

            // Slightly adjust parents to the top sides
            let finalY = levelY;
            if (isParent) {
                finalY = rootY;
                finalX = index === 0 ? rootX - 220 : rootX + 220; // Left and Right of roots
            }

            const node = document.createElement('div');
            node.className = 'node-box';
            node.style.left = `${finalX}px`;
            node.style.top = `${finalY}px`;
            node.style.animationDelay = `${(drawnNodes.length * 0.1) + 0.3}s`; // Staggered pop-in
            
            // Convert fraction to percentage
            const percentage = (share.fraction * 100).toFixed(1) + '%';
            
            node.innerHTML = `
                <div class="node-title">${share.name}</div>
                <div class="node-share" title="${share.reason}">${percentage}</div>
                ${totalWealth > 0 ? `<div class="node-amount">Rs ${Math.round(share.amount).toLocaleString()}</div>` : ''}
            `;
            treeNodes.appendChild(node);
            drawnNodes.push({x: finalX, y: finalY, width: nodeWidth, height: nodeHeight});

            // Draw SVG Line from Root to Node
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            line.setAttribute('class', 'tree-line');
            line.style.animationDelay = `${drawnNodes.length * 0.1}s`;

            // Start from bottom of root for children, side of root for parents/spouses
            let startPointX = rootX + (nodeWidth / 2);
            let startPointY = rootY + nodeHeight;
            let endPointX = finalX + (nodeWidth / 2);
            let endPointY = finalY;

            if (isParent) {
                startPointX = (index === 0) ? rootX : rootX + nodeWidth;
                startPointY = rootY + (nodeHeight / 2);
                endPointX = (index === 0) ? finalX + nodeWidth : finalX;
                endPointY = finalY + (nodeHeight / 2);
            }

            // Draw a curved path
            const pathD = `M ${startPointX} ${startPointY} C ${startPointX} ${(startPointY + endPointY)/2}, ${endPointX} ${(startPointY + endPointY)/2}, ${endPointX} ${endPointY}`;
            line.setAttribute('d', pathD);
            treeLines.appendChild(line);
        };

        // Render Parents
        parents.forEach((p, i) => drawNode(p, i, parents.length, 0, true));
        
        // Render Spouses (A bit below parents)
        spouses.forEach((s, i) => drawNode(s, i, spouses.length, rootY + 140));

        // Render Children (At the bottom)
        const childLevelY = rootY + 280;
        const allChildren = children.concat(others);
        
        // If there are too many children, they might overflow. In a real app we'd add scrolling.
        // We'll wrap them mathematically.
        const maxPerLine = 6;
        let lineCount = 0;
        let currentLineArray = [];

        allChildren.forEach((c, i) => {
            currentLineArray.push(c);
            if (currentLineArray.length === maxPerLine || i === allChildren.length - 1) {
                currentLineArray.forEach((child, j) => {
                    drawNode(child, j, currentLineArray.length, childLevelY + (lineCount * 140));
                });
                lineCount++;
                currentLineArray = [];
            }
        });
    }
});
