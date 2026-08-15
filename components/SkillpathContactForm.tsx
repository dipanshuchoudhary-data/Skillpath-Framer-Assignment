import {
    useCallback,
    useMemo,
    useState,
    startTransition,
    type FormEvent,
} from "react"

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface FormValues {
    name: string
    email: string
    message: string
}

interface FormErrors {
    name?: string
    email?: string
    message?: string
}

/**
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight auto
 */
export default function SkillpathContactForm() {
    const [values, setValues] = useState<FormValues>({
        name: "",
        email: "",
        message: "",
    })
    const [errors, setErrors] = useState<FormErrors>({})
    const [isSubmitted, setIsSubmitted] = useState<boolean>(false)
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

    const isFormComplete = useMemo(() => {
        return (
            values.name.trim().length > 0 &&
            values.email.trim().length > 0 &&
            values.message.trim().length > 0
        )
    }, [values.email, values.message, values.name])

    const validate = useCallback((nextValues: FormValues): FormErrors => {
        const nextErrors: FormErrors = {}
        if (!nextValues.name.trim()) nextErrors.name = "Please enter your name."
        if (!nextValues.email.trim()) {
            nextErrors.email = "Please enter your email."
        } else if (!EMAIL_REGEX.test(nextValues.email.trim())) {
            nextErrors.email = "Please enter a valid email."
        }
        if (!nextValues.message.trim())
            nextErrors.message = "Please enter a message."
        return nextErrors
    }, [])

    const handleFieldChange = useCallback(
        (field: keyof FormValues, value: string) => {
            startTransition(() => {
                setValues((prev) => ({ ...prev, [field]: value }))
                setErrors((prev) => ({ ...prev, [field]: undefined }))
            })
        },
        []
    )

    const handleSubmit = useCallback(
        (event: FormEvent<HTMLFormElement>) => {
            event.preventDefault()
            const nextErrors = validate(values)
            const hasErrors = Object.keys(nextErrors).length > 0

            if (hasErrors) {
                startTransition(() => setErrors(nextErrors))
                return
            }

            startTransition(() => {
                setIsSubmitting(true)
                setErrors({})
            })

            if (typeof window !== "undefined") {
                window.setTimeout(() => {
                    startTransition(() => {
                        setIsSubmitting(false)
                        setIsSubmitted(true)
                    })
                }, 220)
            } else {
                startTransition(() => {
                    setIsSubmitting(false)
                    setIsSubmitted(true)
                })
            }
        },
        [validate, values]
    )

    const resetForm = useCallback(() => {
        startTransition(() => {
            setValues({ name: "", email: "", message: "" })
            setErrors({})
            setIsSubmitted(false)
            setIsSubmitting(false)
        })
    }, [])

    return (
        <section
            style={{
                position: "relative",
                width: "100%",
                boxSizing: "border-box",
                padding: 24,
                background: "#F7F8FA",
            }}
        >
            <style>{`
                .skillpath-contact-root {
                    width: 100%;
                    max-width: 860px;
                    margin: 0 auto;
                    box-sizing: border-box;
                }
                .skillpath-contact-surface {
                    background: #FFFFFF;
                    border: 1px solid #E5E7EB;
                    border-radius: 16px;
                    padding: 26px;
                    box-shadow: 0 2px 8px rgba(23, 32, 51, 0.04);
                }
                .skillpath-contact-title {
                    margin: 0 0 8px 0;
                    color: #172033;
                    font-size: 32px;
                    line-height: 1.08;
                    letter-spacing: -0.02em;
                }
                .skillpath-contact-copy {
                    margin: 0 0 22px 0;
                    color: #667085;
                    font-size: 15px;
                    line-height: 1.5;
                }
                .skillpath-contact-grid {
                    display: grid;
                    gap: 14px;
                }
                .skillpath-contact-field {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                .skillpath-contact-label {
                    color: #172033;
                    font-size: 14px;
                    font-weight: 600;
                    line-height: 1.3;
                }
                .skillpath-contact-input,
                .skillpath-contact-textarea {
                    width: 100%;
                    box-sizing: border-box;
                    border: 1px solid #E5E7EB;
                    border-radius: 12px;
                    background: #FFFFFF;
                    color: #172033;
                    outline: none;
                    font-size: 15px;
                    transition: border-color 0.2s ease, box-shadow 0.2s ease;
                }
                .skillpath-contact-input {
                    height: 48px;
                    padding: 0 14px;
                }
                .skillpath-contact-textarea {
                    min-height: 144px;
                    padding: 12px 14px;
                    resize: vertical;
                }
                .skillpath-contact-input:focus-visible,
                .skillpath-contact-textarea:focus-visible,
                .skillpath-contact-button:focus-visible {
                    border-color: #2563EB;
                    box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.15);
                }
                .skillpath-contact-input[aria-invalid="true"],
                .skillpath-contact-textarea[aria-invalid="true"] {
                    border-color: #DC2626;
                }
                .skillpath-contact-error {
                    margin: 0;
                    color: #B42318;
                    font-size: 13px;
                    line-height: 1.4;
                }
                .skillpath-contact-button {
                    margin-top: 8px;
                    width: fit-content;
                    min-width: 172px;
                    height: 46px;
                    border-radius: 12px;
                    border: 1px solid #2563EB;
                    background: #2563EB;
                    color: #FFFFFF;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: background 0.2s ease, border-color 0.2s ease, opacity 0.2s ease;
                }
                .skillpath-contact-button:hover {
                    background: #1D4ED8;
                    border-color: #1D4ED8;
                }
                .skillpath-contact-button:disabled {
                    opacity: 0.55;
                    cursor: not-allowed;
                }
                .skillpath-contact-successWrap {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 12px;
                }
                .skillpath-contact-reset {
                    background: #FFFFFF;
                    color: #2563EB;
                    border: 1px solid #BFDBFE;
                }
                .skillpath-contact-reset:hover {
                    background: #EFF6FF;
                    border-color: #93C5FD;
                }
                @media (max-width: 767px) {
                    .skillpath-contact-surface {
                        padding: 20px;
                    }
                    .skillpath-contact-title {
                        font-size: 28px;
                    }
                    .skillpath-contact-button {
                        width: 100%;
                    }
                }
            `}</style>

            <div className="skillpath-contact-root">
                <div className="skillpath-contact-surface">
                    {isSubmitted ? (
                        <div
                            className="skillpath-contact-successWrap"
                            role="status"
                            aria-live="polite"
                        >
                            <h2
                                className="skillpath-contact-title"
                                style={{ marginBottom: 2 }}
                            >
                                Message received
                            </h2>
                            <p
                                className="skillpath-contact-copy"
                                style={{ marginBottom: 4 }}
                            >
                                Thanks for reaching out. Your note has been
                                recorded in this demo experience.
                            </p>
                            <button
                                className="skillpath-contact-button skillpath-contact-reset"
                                type="button"
                                onClick={resetForm}
                            >
                                Send another message
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} noValidate>
                            <h2 className="skillpath-contact-title">
                                Contact Skillpath
                            </h2>
                            <p className="skillpath-contact-copy">
                                Share your learning goals and our team will
                                review your note.
                            </p>

                            <div className="skillpath-contact-grid">
                                <div className="skillpath-contact-field">
                                    <label
                                        className="skillpath-contact-label"
                                        htmlFor="skillpath-name"
                                    >
                                        Name
                                    </label>
                                    <input
                                        id="skillpath-name"
                                        className="skillpath-contact-input"
                                        type="text"
                                        required
                                        aria-required="true"
                                        aria-invalid={Boolean(errors.name)}
                                        aria-describedby={
                                            errors.name
                                                ? "skillpath-name-error"
                                                : undefined
                                        }
                                        value={values.name}
                                        onChange={(event) =>
                                            handleFieldChange(
                                                "name",
                                                event.target.value
                                            )
                                        }
                                    />
                                    {errors.name ? (
                                        <p
                                            id="skillpath-name-error"
                                            className="skillpath-contact-error"
                                        >
                                            {errors.name}
                                        </p>
                                    ) : null}
                                </div>

                                <div className="skillpath-contact-field">
                                    <label
                                        className="skillpath-contact-label"
                                        htmlFor="skillpath-email"
                                    >
                                        Email
                                    </label>
                                    <input
                                        id="skillpath-email"
                                        className="skillpath-contact-input"
                                        type="email"
                                        required
                                        aria-required="true"
                                        aria-invalid={Boolean(errors.email)}
                                        aria-describedby={
                                            errors.email
                                                ? "skillpath-email-error"
                                                : undefined
                                        }
                                        value={values.email}
                                        onChange={(event) =>
                                            handleFieldChange(
                                                "email",
                                                event.target.value
                                            )
                                        }
                                    />
                                    {errors.email ? (
                                        <p
                                            id="skillpath-email-error"
                                            className="skillpath-contact-error"
                                        >
                                            {errors.email}
                                        </p>
                                    ) : null}
                                </div>

                                <div className="skillpath-contact-field">
                                    <label
                                        className="skillpath-contact-label"
                                        htmlFor="skillpath-message"
                                    >
                                        Message
                                    </label>
                                    <textarea
                                        id="skillpath-message"
                                        className="skillpath-contact-textarea"
                                        required
                                        aria-required="true"
                                        aria-invalid={Boolean(errors.message)}
                                        aria-describedby={
                                            errors.message
                                                ? "skillpath-message-error"
                                                : undefined
                                        }
                                        value={values.message}
                                        onChange={(event) =>
                                            handleFieldChange(
                                                "message",
                                                event.target.value
                                            )
                                        }
                                    />
                                    {errors.message ? (
                                        <p
                                            id="skillpath-message-error"
                                            className="skillpath-contact-error"
                                        >
                                            {errors.message}
                                        </p>
                                    ) : null}
                                </div>
                            </div>

                            <button
                                className="skillpath-contact-button"
                                type="submit"
                                disabled={isSubmitting || !isFormComplete}
                                aria-label="Send Message"
                            >
                                {isSubmitting ? "Sending..." : "Send Message"}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </section>
    )
}

addPropertyControls(SkillpathContactForm, {})
