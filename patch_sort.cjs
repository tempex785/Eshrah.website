const fs = require('fs');

const sortLogic = `          if (data && data.length > 0) {
            const fetchedSemesters = data.map((d) => d.name).sort((a, b) => {
              const weights: Record<string, number> = {
                'الأولى': 1, '1': 1, 'الاولى': 1, 'أولى': 1, 'اولى': 1,
                'الثانية': 2, '2': 2, 'ثانية': 2,
                'الثالثة': 3, '3': 3, 'ثالثة': 3,
                'الرابعة': 4, '4': 4, 'رابعة': 4,
                'الخامسة': 5, '5': 5, 'خامسة': 5,
                'السادسة': 6, '6': 6, 'سادسة': 6,
                'السابعة': 7, '7': 7, 'سابعة': 7,
              };
              
              let weightA = 99;
              let weightB = 99;
              
              for (const [key, val] of Object.entries(weights)) {
                if (a.includes(key)) weightA = Math.min(weightA, val);
                if (b.includes(key)) weightB = Math.min(weightB, val);
              }
              
              if (weightA !== weightB) return weightA - weightB;
              return a.localeCompare(b, 'ar');
            });
            setSemestersList(fetchedSemesters);
            setSemester(fetchedSemesters[0]);
          }`;

let code = fs.readFileSync('src/pages/Register.tsx', 'utf-8');

const regex = /if \(data && data\.length > 0\) \{[\s\S]*?setSemester\(fetchedSemesters\[0\]\);\s*\}/;
code = code.replace(regex, sortLogic);
fs.writeFileSync('src/pages/Register.tsx', code);
