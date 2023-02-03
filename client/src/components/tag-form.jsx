import theme from "@jdboris/css-themes/space-station";
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
  onCreate,
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
          onCreate();

          return;
        }
      }}
    >
      <div className={theme.h3}>
        {mode === "create" && "New Tag"} {mode === "update" && "Update Tag"}
      </div>
      {sucess?.message && (
        <small className={theme.success}>{sucess.message}</small>
      )}

      {error?.message && <small className={theme.error}>{error.message}</small>}
      <fieldset disabled={isLoading}>
        {error?.details?.name && (
          <div className={theme.error}>
            <AiOutlineExclamationCircle /> {error.details.name}
          </div>
        )}
        <label>
          <FaTag />

          <input
            type="text"
            name="name"
            placeholder="Tag"
            value={tag.name || ""}
            onChange={(e) => {
              if (!e.target.value.toLocaleLowerCase().match(/^[a-z-/]*$/)) {
                errorDetail({
                  name: "Tag may only contain letters and '-', or '/'.",
                });
                return;
              }

              setTag((old) => ({
                ...old,
                name: e.target.value.toLocaleLowerCase(),
              }));
              errorDetail({ name: null });
            }}
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
