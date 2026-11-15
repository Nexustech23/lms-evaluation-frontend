# Schools and colleges

The app serves schools (CBSE classes) and colleges (semesters). Code that differs between them lives in its own folder, so
a school change never touches a college screen and the other way round.

| Folder | What goes there |
|---|---|
| `src/institute/` | The one place that knows the kind of institute: `useInstitute()` and the words each kind uses (`term`). |
| `src/school/` | School-only components and helpers (CBSE paper card, blueprint helpers). |
| `src/college/` | College-only components (the semester based filter bar). |
| everything else | Shared screens. They choose a school or college component with `useInstitute()`; they do not hold school rules. |

A shared page picks like this, once, near the top:

```js
const { isSchool, word } = useInstitute();
return isSchool ? <SchoolFilter ... /> : <CollegeFilter ... />;   // word("semester") is "Class" or "Semester"
```

An institute with no type saved is a college. The institute type comes from `/api/me`.
Backend counterpart: `app/services/school_paper.py` and `app/services/cbse_blueprints.py`.
