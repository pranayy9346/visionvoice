export default function useSmoothScroll() {
  const scrollTo = (id, { offset = 8 } = {}) => {
    const section = document.getElementById(id);
    if (section) {
      const top =
        window.pageYOffset + section.getBoundingClientRect().top - offset;

      window.scrollTo({ top: Math.max(top, 0), behavior: "smooth" });

      window.requestAnimationFrame(() => {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  };

  return { scrollTo };
}
