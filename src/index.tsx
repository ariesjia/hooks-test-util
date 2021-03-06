import * as React from "react"
import { act, render, cleanup } from '@testing-library/react'
import {ReactNode} from "react";

function HookComponent({ hook, updateHook, render}) {
  const current = hook();
  updateHook(current)
  return render ? render({hook: current}) : null
}

interface Option<T> {
  render? ({ hook: T }) : ReactNode,
  parent?: React.ComponentType
}

export type RenderOption<T> = Option<T>

const renderHook = function<T>(hook: () => any, option: RenderOption<T> = {}) {
  let currentHook

  const updateHook = function(val) {
    currentHook = val
  }

  const getComponent = function (componentOption) {
    const ParentComponent = componentOption.parent ? componentOption.parent : React.Fragment

    function Component() {
      return (
        <ParentComponent>
          <HookComponent hook={hook} updateHook={updateHook} render={componentOption.render} />
        </ParentComponent>
      );
    }
    return <Component/>
  }

  const { container, rerender, unmount, ...others } = render(getComponent(option))
  return {
    ...others,
    unmount,
    container: Object.defineProperties(container, {
      hook: {
        get() {
          return currentHook
        },
      }
    }),
    rerender(newOption: Option<T> = {}) {
      currentHook = null
      rerender(getComponent({
        ...option,
        ...newOption,
      }))
    },
  }
}

export default renderHook

export {
  act,
  cleanup,
  renderHook as render,
  render as renderComponent,
}