import { describe, expect, it, vi } from "vitest";

const renderPanel = (): Readonly<{ role: string }> => ({ role: "alert" });
const registerUser = (
    input: Readonly<{ send: () => void }>
): Readonly<{ status: string }> => {
    input.send();

    return { status: "created" };
};

describe("recommended valid fixture", () => {
    it("renders the panel", () => {
        expect.hasAssertions();

        const view = renderPanel();

        expect(view.role).toBe("alert");
        expect(view).toMatchSnapshot();
    });

    it("sends the email", () => {
        expect.hasAssertions();

        const send = vi.fn<() => void>();

        const result = registerUser({ send });

        expect(result.status).toBe("created");
        expect(send).toHaveBeenCalledOnce();
    });
});
