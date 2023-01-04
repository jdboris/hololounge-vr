import theme from "@jdboris/css-themes/space-station/theme.module.scss";
import { useState } from "react";
import { AiOutlineExclamationCircle } from "react-icons/ai";
import { FaTag } from "react-icons/fa";

function TagForm({
  mode: defaultMode,
  tag: defaultTag,
  error,
  setError,
  isLoading,
  saveTag,
}) {
  const [sucess, setSuccess] = useState(null);
  const [mode, setMode] = useState(defaultMode);
  const [tag, setTag] = useState({ ...defaultTag });

  function errorDetail(detail) {
    setSuccess(null);
    setError({
      ...error,
      details: {
        ...error?.details,
        ...detail,
      },
    });
  }

  return (
    <form
      autoComplete="on"
      className={theme.smallForm}
      onSubmit={async (e) => {
        e.preventDefault();

        setSuccess(null);
        setError(null);

        if (mode === "create" || mode === "update") {
          const { name } = await saveTag(tag);
          setTag({});
          setSuccess({ message: `Tag "${name}" created.` });

          return;
        }
      }}
    >
      <fieldset disabled={isLoading}>
        <div className={theme.h3}>
          {mode === "create" && "New Tag"} {mode === "update" && "Update Tag"}
        </div>
        {sucess?.message && (
          <div className={theme.success}>{sucess.message}</div>
        )}
        {error?.message && <div className={theme.error}>{error.message}</div>}
        <label>
          {error?.details?.name && (
            <div className={theme.error}>
              <AiOutlineExclamationCircle /> {error.details.name}
            </div>
          )}
          <FaTag />

          <input
            type="text"
            name="name"
            placeholder="Tag"
            value={tag.name || ""}
            onChange={(e) =>
              setTag((old) => ({ ...old, name: e.target.value })) ||
              errorDetail({ name: null })
            }
          />
        </label>

        {mode === "read" && (
          <button onClick={(e) => e.preventDefault() || setMode("update")}>
            Edit
          </button>
        )}
        {mode === "create" && <button>Add</button>}
        {mode === "update" && <button>Save</button>}
      </fieldset>
    </form>
  );
}

export default TagForm;
