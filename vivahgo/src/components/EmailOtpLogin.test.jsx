import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const clerkState = {
  clerk: { loaded: false },
  signIn: null,
  signUp: null,
};

vi.mock("@clerk/react", () => ({
  useClerk: () => clerkState.clerk,
  useSignIn: () => ({ signIn: clerkState.signIn }),
  useSignUp: () => ({ signUp: clerkState.signUp }),
}));

describe("EmailOtpLogin", () => {
  beforeEach(() => {
    clerkState.clerk = { loaded: false };
    clerkState.signIn = null;
    clerkState.signUp = null;
    vi.useFakeTimers();
    vi.stubEnv("VITE_CLERK_PUBLISHABLE_KEY", "pk_test_local");
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("shows an enabled retry button after Clerk loading times out", async () => {
    const { default: EmailOtpLogin } = await import("./EmailOtpLogin.jsx");

    render(<EmailOtpLogin onLoginSuccess={vi.fn()} />);

    expect(screen.getByRole("button", { name: "Loading..." })).toBeDisabled();

    await act(async () => {
      vi.advanceTimersByTime(10000);
    });

    const retryButton = screen.getByRole("button", { name: "Retry" });
    expect(retryButton).toBeEnabled();
    expect(screen.getByText("Email login took too long to initialize. Refresh the page and try again.")).toBeInTheDocument();
  });

  it("does not render email login on localhost with a production Clerk key", async () => {
    vi.stubEnv("VITE_CLERK_PUBLISHABLE_KEY", "pk_live_example");
    const { default: EmailOtpLogin } = await import("./EmailOtpLogin.jsx");

    const { container } = render(<EmailOtpLogin onLoginSuccess={vi.fn()} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("keeps retry available after timeout instead of trapping the user in a disabled state", async () => {
    const { default: EmailOtpLogin } = await import("./EmailOtpLogin.jsx");

    render(<EmailOtpLogin onLoginSuccess={vi.fn()} />);
    await act(async () => {
      vi.advanceTimersByTime(10000);
    });

    const retryButton = screen.getByRole("button", { name: "Retry" });
    fireEvent.click(retryButton);

    expect(retryButton).toBeEnabled();
    expect(screen.queryByText("Email login is not ready yet. Please wait a moment and try again.")).not.toBeInTheDocument();
  });

  it("enables email login once Clerk is ready and an email is entered", async () => {
    clerkState.clerk = { loaded: true };
    clerkState.signIn = {
      create: vi.fn().mockResolvedValue({}),
      emailCode: {
        sendCode: vi.fn().mockResolvedValue({}),
      },
    };
    clerkState.signUp = {
      create: vi.fn(),
      verifications: {
        sendEmailCode: vi.fn(),
      },
    };

    const { default: EmailOtpLogin } = await import("./EmailOtpLogin.jsx");

    render(<EmailOtpLogin onLoginSuccess={vi.fn()} />);

    const actionButton = screen.getByRole("button", { name: "Get code" });
    expect(actionButton).toBeDisabled();

    fireEvent.change(screen.getByPlaceholderText("Enter your email"), {
      target: { value: "planner@example.com" },
    });

    expect(screen.getByRole("button", { name: "Get code" })).toBeEnabled();
  });

  it("activates the created Clerk session after sign-up OTP verification", async () => {
    vi.useRealTimers();

    const setActive = vi.fn().mockImplementation(async () => {
      window.Clerk.session = {
        getToken: vi.fn().mockResolvedValue("clerk-token"),
      };
      window.Clerk.user = {
        id: "user_123",
        fullName: "Planner User",
        imageUrl: "",
        primaryEmailAddress: { emailAddress: "planner@example.com" },
      };
    });
    const finalize = vi.fn();

    window.Clerk = {
      setActive,
      session: null,
      user: null,
    };
    clerkState.clerk = { loaded: true, setActive };
    clerkState.signIn = {
      create: vi.fn().mockResolvedValue({
        error: { errors: [{ code: "form_identifier_not_found", message: "Not found" }] },
      }),
      emailCode: {
        sendCode: vi.fn(),
        verifyCode: vi.fn(),
      },
    };
    clerkState.signUp = {
      create: vi.fn().mockResolvedValue({}),
      finalize,
      verifications: {
        sendEmailCode: vi.fn().mockResolvedValue({}),
        verifyEmailCode: vi.fn().mockResolvedValue({
          status: "complete",
          createdSessionId: "sess_123",
        }),
      },
    };

    const { default: EmailOtpLogin } = await import("./EmailOtpLogin.jsx");
    const onLoginSuccess = vi.fn();

    render(<EmailOtpLogin onLoginSuccess={onLoginSuccess} />);

    fireEvent.change(screen.getByPlaceholderText("Enter your email"), {
      target: { value: "planner@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Get code" }));

    expect(await screen.findByPlaceholderText("Enter 6-digit code")).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText("Enter 6-digit code"), {
      target: { value: "123456" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Verify" }));

    await waitFor(() => {
      expect(setActive).toHaveBeenCalledWith({ session: "sess_123" });
    });
    expect(finalize).not.toHaveBeenCalled();
    expect(onLoginSuccess).toHaveBeenCalled();
  });
});
