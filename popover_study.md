# Popovers

## Objective:
To investigate popovers and their use cases and to come up with tangible conclusions.

## Categories of Popovers:
- Menu
- Popup Button
- Dialog

## Notes on above categories:
- Menu must support keyboard navigation
- Popup Button is a superset of Menu
 - It can have unstructured content

## Libraries used

1. PopperJS
- ["@popperjs/core": "^2.11.6"](https://github.com/mui/material-ui/blob/master/packages/mui-base/package.json)
- Used in
 - packages/mui-material/src/Popper/Popper.spec.tsx `{ Instance }`
 - docs/data/material/components/tooltips/AnchorElTooltips.tsx `{ Instance }`
 - packages/mui-base/src/PopperUnstyled/PopperUnstyled.d.ts `{ Instance, VirtualElement, Options, OptionsGeneric }`
 - packages/mui-base/src/PopperUnstyled/PopperUnstyled.js `{ createPopper }`

### PopperUnstyled component
- relevant props: `{ disablePortal = false }`
- Structure:
 - <Portal disablePortal={disablePortal}>
      <PopperTooltip>
        {children}
      </PopperTooltip>
    </Portal>
- The `useEnhancedEffect` invocation of `PopperTooltip` contains `createPopper` invocation from the `PopperJS` library
- Usage in lot of places (79) including
 - format: `packages/<mui-lib>/src/<Component>/<Component>.tsx`
 - mui-material: `{ Popper }`
 - mui-base: `{ MenuUnstyled, SelectUnstyled, MultiSelectUnstyled }`
 - also in `docs/data/base/components/popper/`: `{ SimplePopper, PlacementPopper }`