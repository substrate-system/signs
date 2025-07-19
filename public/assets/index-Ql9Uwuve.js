(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
const CycleError = new Error("Cycle detected");
const _effectStack = [];
let _globalMaxDepth = 100;
function sign(value, options) {
  const subscriptions = /* @__PURE__ */ new Set();
  return {
    get value() {
      const currentEffect = _effectStack[_effectStack.length - 1];
      if (currentEffect) {
        subscriptions.add(currentEffect);
      }
      return value;
    },
    set value(newValue) {
      if (newValue === value) return;
      value = newValue;
      subscriptions.forEach((fn) => fn());
    },
    peek() {
      return value;
    }
  };
}
function effect(fn) {
  const effectFn = () => {
    if (_effectStack.length > _globalMaxDepth) {
      throw CycleError;
    }
    _effectStack.push(effectFn);
    try {
      fn();
    } finally {
      _effectStack.pop();
    }
  };
  effectFn();
  return () => {
    fn = () => {
    };
  };
}
const qs = document.querySelector.bind(document);
const count = sign(0);
qs("#root").innerHTML = `
    <h1 class="count">${count.value}</h1>
    <button class="plus">Plus</button>
    <button class="reset">Reset</button>
`;
effect(() => {
  qs("h1").innerHTML = count.value;
});
qs("button.reset").addEventListener("click", (ev) => {
  ev.preventDefault();
  count.value = 0;
});
const btn = qs("button");
btn.addEventListener("click", (ev) => {
  ev.preventDefault();
  count.value++;
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXgtUWw5VXd1dmUuanMiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9pbmRleC50cyIsIi4uLy4uL2V4YW1wbGUvaW5kZXgudHMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGNvbnN0IEN5Y2xlRXJyb3IgPSBuZXcgRXJyb3IoJ0N5Y2xlIGRldGVjdGVkJylcblxuY29uc3QgX2VmZmVjdFN0YWNrOiAoKCkgPT4gYW55KVtdID0gW11cbmxldCBfZ2xvYmFsTWF4RGVwdGggPSAxMDBcbmNvbnN0IERFRkFVTFRfTUFYX0RFUFRIID0gMTAwXG5cbmV4cG9ydCB0eXBlIFNpZ25PcHRpb25zID0ge1xuICAgIG1heERlcHRoPzogbnVtYmVyXG59XG5cbmV4cG9ydCB0eXBlIFNpZ248VD4gPSB7XG4gICAgdmFsdWU6VFxuICAgIHBlZWs6ICgpPT5UXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzaWduPFQ+ICh2YWx1ZTpULCBvcHRpb25zPzogU2lnbk9wdGlvbnMpOlNpZ248VD4ge1xuICAgIGNvbnN0IG1heERlcHRoID0gb3B0aW9ucz8ubWF4RGVwdGggPz8gREVGQVVMVF9NQVhfREVQVEhcbiAgICBjb25zdCBzdWJzY3JpcHRpb25zID0gbmV3IFNldDwoKT0+YW55PigpXG5cbiAgICAvLyBJZiB0aGlzIHNpZ25hbCBoYXMgYSBjdXN0b20gbWF4RGVwdGgsIHNldCBpdCBnbG9iYWxseVxuICAgIGlmIChvcHRpb25zPy5tYXhEZXB0aCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIF9nbG9iYWxNYXhEZXB0aCA9IG1heERlcHRoXG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgZ2V0IHZhbHVlICgpOiBUIHtcbiAgICAgICAgICAgIGNvbnN0IGN1cnJlbnRFZmZlY3QgPSBfZWZmZWN0U3RhY2tbX2VmZmVjdFN0YWNrLmxlbmd0aCAtIDFdXG4gICAgICAgICAgICBpZiAoY3VycmVudEVmZmVjdCkge1xuICAgICAgICAgICAgICAgIHN1YnNjcmlwdGlvbnMuYWRkKGN1cnJlbnRFZmZlY3QpXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB2YWx1ZVxuICAgICAgICB9LFxuXG4gICAgICAgIHNldCB2YWx1ZSAobmV3VmFsdWU6IFQpIHtcbiAgICAgICAgICAgIGlmIChuZXdWYWx1ZSA9PT0gdmFsdWUpIHJldHVyblxuICAgICAgICAgICAgdmFsdWUgPSBuZXdWYWx1ZVxuICAgICAgICAgICAgc3Vic2NyaXB0aW9ucy5mb3JFYWNoKGZuID0+IGZuKCkpXG4gICAgICAgIH0sXG5cbiAgICAgICAgcGVlayAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWVcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGVmZmVjdCAoZm46KCk9PmFueSk6KCk9PnZvaWQge1xuICAgIGNvbnN0IGVmZmVjdEZuID0gKCkgPT4ge1xuICAgICAgICBpZiAoX2VmZmVjdFN0YWNrLmxlbmd0aCA+IF9nbG9iYWxNYXhEZXB0aCkge1xuICAgICAgICAgICAgdGhyb3cgQ3ljbGVFcnJvclxuICAgICAgICB9XG4gICAgICAgIF9lZmZlY3RTdGFjay5wdXNoKGVmZmVjdEZuKVxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgZm4oKVxuICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgX2VmZmVjdFN0YWNrLnBvcCgpXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBlZmZlY3RGbigpXG5cbiAgICAvLyBVbnN1YnNjcmliZSBmdW5jdGlvblxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgIC8vIFRoaXMgaXMgYSBiaXQgdHJpY2t5LiBXZSBjYW4ndCBlYXNpbHkgcmVtb3ZlIHRoaXMgZWZmZWN0XG4gICAgICAgIC8vIGZyb20gYWxsIHNpZ25hbHMgaXQgc3Vic2NyaWJlZCB0byB3aXRob3V0IG1vcmUgdHJhY2tpbmcuXG4gICAgICAgIC8vIEEgc2ltcGxlIHdheSBpcyB0byBtYWtlIHRoZSBlZmZlY3QgZnVuY3Rpb24gYSBuby1vcC5cbiAgICAgICAgLy8gQSBtb3JlIHJvYnVzdCBpbXBsZW1lbnRhdGlvbiB3b3VsZCBoYXZlIHNpZ25hbHMgdHJhY2sgdGhlaXIgZWZmZWN0c1xuICAgICAgICAvLyBhbmQgYSB3YXkgdG8gcmVtb3ZlIHRoZW0uIEZvciBub3csIHRoaXMgaXMgYSBzaW1wbGUgYXBwcm9hY2guXG4gICAgICAgIGZuID0gKCkgPT4ge31cbiAgICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb21wdXRlZDxUPiAoZm46KCk9PlQpOlNpZ248VD4ge1xuICAgIGNvbnN0IGluaXRpYWxWYWx1ZSA9IGZuKClcbiAgICBjb25zdCBjb21wdXRlZFNpZ24gPSBzaWduKGluaXRpYWxWYWx1ZSlcblxuICAgIGVmZmVjdCgoKSA9PiB7XG4gICAgICAgIGNvbXB1dGVkU2lnbi52YWx1ZSA9IGZuKClcbiAgICB9KVxuXG4gICAgcmV0dXJuIGNvbXB1dGVkU2lnblxufVxuIiwiaW1wb3J0IHsgZWZmZWN0LCBzaWduIH0gZnJvbSAnLi4vc3JjL2luZGV4LmpzJ1xuY29uc3QgcXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yLmJpbmQoZG9jdW1lbnQpXG5cbmNvbnN0IGNvdW50ID0gc2lnbigwKVxuXG5xcygnI3Jvb3QnKS5pbm5lckhUTUwgPSBgXG4gICAgPGgxIGNsYXNzPVwiY291bnRcIj4ke2NvdW50LnZhbHVlfTwvaDE+XG4gICAgPGJ1dHRvbiBjbGFzcz1cInBsdXNcIj5QbHVzPC9idXR0b24+XG4gICAgPGJ1dHRvbiBjbGFzcz1cInJlc2V0XCI+UmVzZXQ8L2J1dHRvbj5cbmBcblxuZWZmZWN0KCgpID0+IHtcbiAgICBxcygnaDEnKS5pbm5lckhUTUwgPSBjb3VudC52YWx1ZVxufSlcblxucXMoJ2J1dHRvbi5yZXNldCcpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZXYgPT4ge1xuICAgIGV2LnByZXZlbnREZWZhdWx0KClcbiAgICBjb3VudC52YWx1ZSA9IDBcbn0pXG5cbmNvbnN0IGJ0biA9IHFzKCdidXR0b24nKSBhcyBIVE1MQnV0dG9uRWxlbWVudFxuYnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZXYgPT4ge1xuICAgIGV2LnByZXZlbnREZWZhdWx0KClcbiAgICBjb3VudC52YWx1ZSsrXG59KVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBTyxNQUFNLGFBQWEsSUFBSSxNQUFNLGdCQUFnQjtBQUVwRCxNQUFNLGVBQThCLENBQUE7QUFDcEMsSUFBSSxrQkFBa0I7QUFZZixTQUFTLEtBQVMsT0FBUyxTQUErQjtBQUU3RCxRQUFNLG9DQUFvQixJQUFBO0FBTzFCLFNBQU87QUFBQSxJQUNILElBQUksUUFBWTtBQUNaLFlBQU0sZ0JBQWdCLGFBQWEsYUFBYSxTQUFTLENBQUM7QUFDMUQsVUFBSSxlQUFlO0FBQ2Ysc0JBQWMsSUFBSSxhQUFhO0FBQUEsTUFDbkM7QUFFQSxhQUFPO0FBQUEsSUFDWDtBQUFBLElBRUEsSUFBSSxNQUFPLFVBQWE7QUFDcEIsVUFBSSxhQUFhLE1BQU87QUFDeEIsY0FBUTtBQUNSLG9CQUFjLFFBQVEsQ0FBQSxPQUFNLEdBQUEsQ0FBSTtBQUFBLElBQ3BDO0FBQUEsSUFFQSxPQUFRO0FBQ0osYUFBTztBQUFBLElBQ1g7QUFBQSxFQUFBO0FBRVI7QUFFTyxTQUFTLE9BQVEsSUFBcUI7QUFDekMsUUFBTSxXQUFXLE1BQU07QUFDbkIsUUFBSSxhQUFhLFNBQVMsaUJBQWlCO0FBQ3ZDLFlBQU07QUFBQSxJQUNWO0FBQ0EsaUJBQWEsS0FBSyxRQUFRO0FBQzFCLFFBQUk7QUFDQSxTQUFBO0FBQUEsSUFDSixVQUFBO0FBQ0ksbUJBQWEsSUFBQTtBQUFBLElBQ2pCO0FBQUEsRUFDSjtBQUVBLFdBQUE7QUFHQSxTQUFPLE1BQU07QUFNVCxTQUFLLE1BQU07QUFBQSxJQUFDO0FBQUEsRUFDaEI7QUFDSjtBQ3JFQSxNQUFNLEtBQUssU0FBUyxjQUFjLEtBQUssUUFBUTtBQUUvQyxNQUFNLFFBQVEsS0FBSyxDQUFDO0FBRXBCLEdBQUcsT0FBTyxFQUFFLFlBQVk7QUFBQSx3QkFDQSxNQUFNLEtBQUs7QUFBQTtBQUFBO0FBQUE7QUFLbkMsT0FBTyxNQUFNO0FBQ1QsS0FBRyxJQUFJLEVBQUUsWUFBWSxNQUFNO0FBQy9CLENBQUM7QUFFRCxHQUFHLGNBQWMsRUFBRSxpQkFBaUIsU0FBUyxDQUFBLE9BQU07QUFDL0MsS0FBRyxlQUFBO0FBQ0gsUUFBTSxRQUFRO0FBQ2xCLENBQUM7QUFFRCxNQUFNLE1BQU0sR0FBRyxRQUFRO0FBQ3ZCLElBQUksaUJBQWlCLFNBQVMsQ0FBQSxPQUFNO0FBQ2hDLEtBQUcsZUFBQTtBQUNILFFBQU07QUFDVixDQUFDOyJ9
