import { describe, expect, it, vi } from "vitest";

const renderPanel = (): Readonly<{ role: string }> => ({ role: "alert" });
const registerUser = (input: Readonly<{ send: () => void }>): void => {
    input.send();
};

describe("recommended weak-test fixture", () => {
    it("renders the panel", () => {
        expect.hasAssertions();

        expect(renderPanel()).toMatchSnapshot();
    });

    it("sends the email", () => {
        expect.hasAssertions();

        const send = vi.fn<() => void>();

        registerUser({ send });

        expect(send).toHaveBeenCalledOnce();
    });
});
