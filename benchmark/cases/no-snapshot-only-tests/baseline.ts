import { describe, expect, it } from "vitest";

const renderPanel = (): Readonly<{ role: string }> => ({ role: "alert" });

describe("renderPanel", () => {
    it("renders a panel", () => {
        expect.hasAssertions();

        expect(renderPanel()).toMatchSnapshot();
    });
});
