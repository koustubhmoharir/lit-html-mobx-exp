# HTML Native Popovers

Two native HTML popovers
- Dialog
- Menu

## Menu
- Usage:
-  In early versions of the HTML specification, the `<menu>` element had an additional use case as a context menu. This functionality is considered obsolete and is not in the specification.
- The `<menu>` tag is only supported in Firefox, and it only works for context menus.
	- Doesn't even seem to work there

## Dialog
- Usage:
    ```
    <dialog open>
        Dialog Content
    </dialog>
    ```
- The dialog tag is not supported in Safari and Edge (prior version 79).
	- According to [caniuse.com](https://caniuse.com/dialog) supported by all except IE and Opera Mini
- Parent of the dialog element is the logical parent in the HTML tree

### show() vs showModal()
- `position: absolute` vs `position: fixed`
- `showModal()` renders a `::backdrop` pseudo element
	- can be styled with `dialog::backdrop` CSS selector
- Logical order (next element placed above) and z-index of other element
	- Takes precedence in `show()` - dialog gets hidden from view
	- Doesn't matter in `showModal()` - dialog is displayed at the top

### Dialog case studies

#### 1. [How To Style HTML Dialog Element [CSS Tutorial]](https://www.lambdatest.com/blog/html-dialog-element/)
- By default, dialog has `display: none` property to the existing CSS.
	- Depends on `open` attribute
- The `show()` or `showModal()` methods in JavaScript help display a dialog
	- `showModal()` is used to display the dialog by adding a backdrop cover so that users cannot interact with the website.
        - Can be closed by click-away or Escape key
- `close()` method of the HTML dialog element is used to close the dialog
- Gmail does not actually use dialog for new message
	- instead uses `order: 1; z-index: 1000;`
- can use `<header>`, `<section>`, `<footer>` and `<button>` to provide structure

#### 2. Dialog inside smaller div
- `showModal()` works normally since position is fixed
- `show()` does not affect its size or margins
	- However, since position is absolute, it opens up starting at the y offset

#### 3. Dialog inside dialog
- If `showModal()` done on both, the inner dialog renders above the outer one
- If `show()` done on the inner dialog, the outer dialog dimensions stay the same
	- Inner dialog is rendered within the outer, with scroll bars
- If outer dialog is closed, then inner dialog also not shown
	- This is due to the `display: none` CSS property

#### 4. "Sticky" position in menus
- For this case, "sticky" would mean, if the page is scrolled after the menu is open, the menu would stay in view
- In Gmail, the menu goes out of view with scroll
- In mobile, action menu collapses on scroll (Vinay N)
	- Depends on the context in which menu is used
- For an infinite scrolling table, which trims it content (including state purge) once items go beyond viewport, a sticky menu or a state-preserved menu can likely cause implementation challenges

### Evaluation

- Alert / Prompt - **Yes** - `position: fixed;` and `showModal()`
- Modal - **Yes**
- Prevent background scroll - **No**
- Menu - **Yes** - Can be implemented with `position: absolute; top: --y; margin-left: --x;`
- Keyboard navigation - **Yes** - `focus()`, `onkeydown` event and using the `previousElementSibling` and `nextElementSibling` properties
- Popup button - **Yes** - Similar to Menu

### Notes

- Content has to be placed below the dialog when in `show()` mode