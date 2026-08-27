const fs = require('fs');

let code = fs.readFileSync('src/pages/Register.tsx', 'utf-8');

// Replace governorate input
const govRegex = /<div className="relative group">\s*<input\s*type="text"\s*name="governorate"[\s\S]*?<\/datalist>\s*<\/div>/;
const newGov = `<CustomSelect
            name="governorate"
            value={formData.governorate}
            onChange={handleChange}
            required={true}
            placeholder={t('governorate')}
            options={governorates.map(g => ({ value: g, label: g }))}
          />`;

code = code.replace(govRegex, newGov);

// Replace collegeName input
const colRegex = /<div className="relative group">\s*<MapPin className="absolute right-0 top-3 w-5 h-5 text-burgundy-500 group-focus-within:text-burgundy-400 transition-colors" \/>\s*<input\s*type="text"\s*name="collegeName"[\s\S]*?<\/datalist>\s*<\/div>/;
const newCol = `<CustomSelect
            name="collegeName"
            value={formData.collegeName}
            onChange={handleChange}
            required={true}
            placeholder={t('collegeName')}
            options={universities.map(u => ({ value: u, label: u }))}
          />`;

code = code.replace(colRegex, newCol);

// Replace semester sort
const semesterSortRegex = /\.order\('created_at', \{ ascending: true \}\);/;
const newSemesterSort = `.order('name', { ascending: true });`;
// Wait, name sorting might be "الفرقة الأولى" vs "الفرقة الثانية", string sort will put "الأولى" then "الثانية"?
// "أ" comes before "ث". "الثالثة" (ث) comes after "الثانية" (ثا). "الرابعة" (ر).
// Let's just do it in JS.
// Wait, `order('created_at')` was used. We can fetch without ordering, and then sort in JS.

fs.writeFileSync('src/pages/Register.tsx', code);
