import { describe, expect, it } from "vitest";

const renderPanel = (
    options: Readonly<{ state: "error" | "loading" }>
): Readonly<{ state: "error" | "loading" }> => options;

describe("renderPanel", () => {
    it("renders the error state", () => {
        expect.hasAssertions();

        expect(renderPanel({ state: "error" })).toMatchSnapshot();
    });

    it("renders the loading state", () => {
        expect.hasAssertions();

        expect(renderPanel({ state: "loading" })).toMatchInlineSnapshot();
    });
});
