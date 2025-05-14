import { createPortal } from "react-dom";
import { useImperativeHandle, useRef } from "react";

import Button from "../Button/Button.jsx";

export default function Modal({ children, ref, btnText }) {
  const dialog = useRef();
  useImperativeHandle(ref, () => {
    return {
      open() {
        dialog.current.showModal();
      }
    }
  });

  return createPortal(
    <dialog ref={ dialog } className="backdrop:bg-stone-900/90 p-4 round-md shadow-md">
      { children }
      <form method="dialog" className="mt-4 text-right">
        <Button>{ btnText }</Button>
      </form>
    </dialog>,
    document.getElementById("modal-root")
  );
}