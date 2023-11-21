import { useEffect, useRef } from "react";
import { useMemo } from "react";
import "./App.css";

const text = `Die Verpflegung im Hipotels Mediterráneo Club wird als vielfältig beschrieben, wobei Gäste zwischen verschiedenen Verpflegungsarten wie Halbpension und All Inclusive wählen können. Laut Beschreibung von CHECK24 ist die Hotelküche international, italienisch, mediterran und spanisch ausgerichtet. Zudem wird für Kinder ein spezielles Nudel- und Pizzabuffet angeboten, und es gibt auch ein Tapas-Restaurant <em>1</em>. Bewertungen aus der Vergangenheit zeigen gemischte Eindrücke bezüglich des Essens. Eine Bewertung aus dem Jahr 2019 kritisiert, dass das Essen zu monoton sei und sich fast täglich wiederhole <em>2</em>, wohingegen eine andere Bewertung aus dem Jahr 2023 die Verpflegung mit einem Kantinenbetrieb vergleicht, dies aber im Kontext eines ansonsten positiven Gesamterlebnisses sieht <em>3</em>. Bitte beachten Sie, dass diese Bewertungen aus dem Jahr 2019 und April 2023 stammen und möglicherweise seitdem Veränderungen in der Qualität und Vielfalt der Verpflegung stattgefunden haben könnten. Für aktualisierte Informationen zur Essensqualität und Verpflegung sollten Sie sich an den Kundenservice von CHECK24 wenden.`;
const words = text.split(" ");
const responses = words.reduce<string[]>((acc, word) => {
  if (acc.length === 0) {
    acc.push(word);
  } else {
    acc.push(`${acc[acc.length - 1]} ${word}`);
  }
  return acc;
}, []);

let index = 0;
const fetchResponse = async () => {
  if (index >= responses.length) {
    return null;
  }
  return responses[index++];
};

const animationState = {
  index: 0,
  text: "",
};

const stripNodes = (el: HTMLElement, remaining: number) => {
  // we need to copy the childNodes into an array
  // because removing nodes while iterating over
  // childNodes directly causes issues
  const nodes = Array.from(el.childNodes);
  for (const node of nodes) {
    if (remaining <= 0) {
      node.remove();
      continue;
    }
    if (node instanceof Text) {
      const text = (node.textContent ?? "").substring(0, remaining);
      remaining -= text.length;
      node.textContent = text;
    } else if (node instanceof HTMLElement) {
      remaining = stripNodes(node, remaining);
    } else {
      console.log("should not happen:", node, remaining);
    }
  }
  return remaining;
};

/**
 * Danny will love this! <3
 */
class AnimationController {
  #element: HTMLElement | null = null;
  #intervalId: number | null = null;
  #currentPosition = 0;
  html = "";

  #update() {
    this.#currentPosition++;
    if (this.#element === null) {
      return;
    }
    const el = this.#element;
    el.innerHTML = this.html;
    if (this.#currentPosition >= el.innerText.length) {
      this.stop();
      return;
    }
    stripNodes(el, this.#currentPosition);
  }

  connect(element: HTMLElement) {
    this.#element = element;
  }

  disconnect() {
    this.stop();
    this.#element = null;
  }

  start(intervalMs = 50) {
    if (this.#intervalId !== null) {
      return;
    }
    this.#intervalId = setInterval(() => {
      this.#update();
    }, intervalMs);
  }

  stop() {
    if (this.#intervalId !== null) {
      clearInterval(this.#intervalId);
    }
    this.#intervalId = null;
  }
}

export default function App() {
  const animationRef = useRef<typeof animationState>();
  if (!animationRef.current) {
    animationRef.current = { ...animationState };
  }
  const elementRef = useRef<HTMLElement>();
  const controller = useMemo(() => new AnimationController(), []);
  useEffect(() => {
    const id = setInterval(async () => {
      const response = await fetchResponse();
      if (response === null) {
        clearInterval(id);
        return;
      }
      controller.html = response;
      controller.start();
    }, 100);
    return () => {
      clearInterval(id);
    };
  }, []);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) {
      return;
    }
    controller.connect(element);
    controller.start();
    return () => {
      controller.stop();
      controller.disconnect();
    };
  }, []);
  return (
    <div className="App">
      <h1>Hello CodeSandbox</h1>
      <h2>Start editing to see some magic happen!</h2>
      <div ref={elementRef} />
    </div>
  );
}
