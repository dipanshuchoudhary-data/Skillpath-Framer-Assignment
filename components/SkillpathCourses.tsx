import {
    useCallback,
    useEffect,
    useMemo,
    useState,
    startTransition,
    type CSSProperties,
} from "react"
import { addPropertyControls, ControlType } from "framer"

interface Course {
    courseName: string
    courseCode: string
    description: string
    mainCategory: string
    shortCourse: string
    courseType: string
    pricePaise: number
    priceUsdCents: number
    mangoId: string
    refundable: boolean
}

interface MyComponentProps {
    sectionTitle: string
    refundableBadge: boolean
    style?: CSSProperties
}

type SortOption = "default" | "priceLowToHigh" | "priceHighToLow"

const COURSES_URL =
    "https://syncsphere-hiv6.onrender.com/assignment/course-data"
const COUNTRY_URL =
    "https://syncsphere-hiv6.onrender.com/assignment/country-code"
const DESKTOP_COLUMNS = 3
const TABLET_COLUMNS = 2
const MOBILE_COLUMNS = 1

function getPriceFromPaise(course: Course): number {
    const rawPaise = Number(course?.pricePaise)
    return Number.isFinite(rawPaise) ? rawPaise / 100 : 0
}

function formatInrPrice(course: Course): string {
    const price = getPriceFromPaise(course)
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(price)
}

async function fetchJson<T>(url: string): Promise<T> {
    const response = await fetch(url, { method: "GET" })
    if (!response.ok) throw new Error("Request failed")
    return (await response.json()) as T
}

/**
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight auto
 */
export default function SkillpathCourses(props: MyComponentProps) {
    const { sectionTitle, refundableBadge, style } = props
    const [courses, setCourses] = useState<Course[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [hasCourseError, setHasCourseError] = useState<boolean>(false)
    const [searchQuery, setSearchQuery] = useState<string>("")
    const [sortBy, setSortBy] = useState<SortOption>("default")

    const loadData = useCallback(async () => {
        startTransition(() => {
            setIsLoading(true)
            setHasCourseError(false)
        })

        // Country data is informational; the course list remains the critical dependency.
        const [coursesResult, countryResult] = await Promise.allSettled([
            fetchJson<Course[]>(COURSES_URL),
            fetchJson<unknown>(COUNTRY_URL),
        ])

        const countryRequestFailed = countryResult.status === "rejected"
        if (countryRequestFailed) {
            // Keep the UI focused on the main course dataset; this is non-critical.
        }

        if (
            coursesResult.status === "fulfilled" &&
            Array.isArray(coursesResult.value)
        ) {
            startTransition(() => {
                setCourses(coursesResult.value)
                setHasCourseError(false)
            })
        } else {
            startTransition(() => {
                setCourses([])
                setHasCourseError(true)
            })
        }

        startTransition(() => setIsLoading(false))
    }, [])

    useEffect(() => {
        loadData()
    }, [loadData])

    const visibleCourses = useMemo(() => {
        const query = searchQuery.trim().toLowerCase()
        const filtered = courses.filter((course) => {
            if (!query) return true
            return (
                course.courseName?.toLowerCase().includes(query) ||
                course.description?.toLowerCase().includes(query) ||
                course.mainCategory?.toLowerCase().includes(query)
            )
        })

        const sorted = [...filtered]
        if (sortBy === "priceLowToHigh") {
            sorted.sort((a, b) => getPriceFromPaise(a) - getPriceFromPaise(b))
        } else if (sortBy === "priceHighToLow") {
            sorted.sort((a, b) => getPriceFromPaise(b) - getPriceFromPaise(a))
        }
        return sorted
    }, [courses, searchQuery, sortBy])

    return (
        <section
            style={{
                ...style,
                position: "relative",
                width: "100%",
                boxSizing: "border-box",
                padding: 28,
                background: "#F7F8FA",
            }}
        >
            <style>{`
                .skillpath-root { width: 100%; box-sizing: border-box; max-width: 1280px; margin: 0 auto; }
                .skillpath-header {
                    margin: 0 0 20px 0;
                    color: #172033;
                    font-size: 38px;
                    font-weight: 700;
                    line-height: 1.05;
                    letter-spacing: -0.025em;
                }
                .skillpath-controls {
                    display: flex;
                    gap: 14px;
                    margin-bottom: 22px;
                    align-items: center;
                }
                .skillpath-searchWrap {
                    position: relative;
                    flex: 1;
                    min-width: 0;
                }
                .skillpath-searchIcon {
                    position: absolute;
                    left: 16px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #667085;
                    font-size: 15px;
                    line-height: 1;
                    pointer-events: none;
                }
                .skillpath-search,
                .skillpath-sort {
                    height: 48px;
                    border-radius: 12px;
                    border: 1px solid #E5E7EB;
                    padding: 0 14px;
                    font-size: 15px;
                    outline: none;
                    transition: border-color 0.2s ease, box-shadow 0.2s ease;
                    background: #FFFFFF;
                    color: #172033;
                }
                .skillpath-search { width: 100%; padding-left: 42px; }
                .skillpath-sort { width: 260px; }
                .skillpath-search:focus-visible,
                .skillpath-sort:focus-visible,
                .skillpath-btn:focus-visible {
                    border-color: #2563EB;
                    box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.15);
                }
                .skillpath-grid {
                    display: grid;
                    grid-template-columns: repeat(${DESKTOP_COLUMNS}, minmax(0, 1fr));
                    gap: 18px;
                }
                .skillpath-card {
                    border: 1px solid #E5E7EB;
                    border-radius: 18px;
                    padding: 30px 28px;
                    background: #FFFFFF;
                    box-shadow: 0 2px 7px rgba(23, 32, 51, 0.04);
                    transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
                    min-height: 270px;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .skillpath-card:hover {
                    transform: translateY(-4px);
                    border-color: #93B4F8;
                    box-shadow: 0 14px 28px rgba(37, 99, 235, 0.12);
                }
                .skillpath-top {
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    gap: 10px;
                    flex-wrap: wrap;
                }
                .skillpath-category {
                    color: #667085;
                    font-size: 11px;
                    text-transform: uppercase;
                    font-weight: 500;
                    line-height: 1.2;
                    letter-spacing: 0.06em;
                }
                .skillpath-title {
                    color: #172033;
                    font-size: 23px;
                    font-weight: 700;
                    line-height: 1.2;
                    margin: 0;
                    display: -webkit-box;
                    -webkit-box-orient: vertical;
                    -webkit-line-clamp: 2;
                    overflow: hidden;
                    min-height: calc(1.2em * 2);
                }
                .skillpath-description {
                    margin: 0;
                    color: #667085;
                    font-size: 15px;
                    line-height: 1.55;
                    display: -webkit-box;
                    -webkit-box-orient: vertical;
                    -webkit-line-clamp: 2;
                    overflow: hidden;
                    min-height: calc(1.55em * 2);
                }
                .skillpath-meta {
                    margin-top: auto;
                    padding-top: 14px;
                    border-top: 1px solid #E5E7EB;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 10px;
                }
                .skillpath-type {
                    font-size: 14px;
                    color: #667085;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    flex-wrap: wrap;
                }
                .skillpath-separator {
                    color: #D1D5DB;
                    font-size: 12px;
                    line-height: 1;
                }
                .skillpath-price {
                    font-size: 20px;
                    font-weight: 700;
                    color: #172033;
                    margin-left: auto;
                }
                .skillpath-badge {
                    font-size: 11px;
                    line-height: 1.2;
                    padding: 4px 8px;
                    border-radius: 999px;
                    border: 1px solid #D1D5DB;
                    color: #4B5563;
                    background: #F9FAFB;
                    font-weight: 500;
                    white-space: nowrap;
                }
                .skillpath-btn {
                    border: 1px solid #2563EB;
                    background: #2563EB;
                    color: #FFFFFF;
                    border-radius: 12px;
                    height: 44px;
                    padding: 0 18px;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    outline: none;
                    transition: background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
                }
                .skillpath-btn:hover {
                    background: #1D4ED8;
                    border-color: #1D4ED8;
                }
                .skillpath-btnSecondary {
                    border: 1px solid #C7D2FE;
                    background: #FFFFFF;
                    color: #2563EB;
                }
                .skillpath-btnSecondary:hover {
                    background: #EEF2FF;
                    border-color: #A5B4FC;
                }
                .skillpath-actions {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    flex-wrap: wrap;
                }
                .skillpath-status {
                    border: 1px solid #E5E7EB;
                    border-radius: 18px;
                    padding: 34px 26px;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    color: #172033;
                    align-items: center;
                    text-align: center;
                    background: #FFFFFF;
                }
                .skillpath-skeleton {
                    border: 1px solid #E5E7EB;
                    border-radius: 18px;
                    padding: 30px 28px;
                    min-height: 270px;
                    background: #FFFFFF;
                    position: relative;
                    overflow: hidden;
                }
                .skillpath-skeleton-line {
                    background: #EEF2F7;
                    border-radius: 8px;
                    height: 12px;
                    margin-bottom: 10px;
                    position: relative;
                    overflow: hidden;
                }
                .skillpath-skeleton-line::after {
                    content: "";
                    position: absolute;
                    inset: 0;
                    transform: translateX(-100%);
                    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.75), transparent);
                    animation: skillpathShimmer 1.4s infinite;
                }
                @keyframes skillpathShimmer {
                    100% { transform: translateX(100%); }
                }
                @media (max-width: 1023px) {
                    .skillpath-grid {
                        grid-template-columns: repeat(${TABLET_COLUMNS}, minmax(0, 1fr));
                    }
                }
                @media (max-width: 767px) {
                    .skillpath-root {
                        max-width: 100%;
                    }
                    .skillpath-header {
                        font-size: 32px;
                    }
                    .skillpath-controls {
                        flex-direction: column;
                        align-items: stretch;
                    }
                    .skillpath-searchWrap {
                        width: 100%;
                    }
                    .skillpath-sort {
                        width: 100%;
                    }
                    .skillpath-grid {
                        grid-template-columns: repeat(${MOBILE_COLUMNS}, minmax(0, 1fr));
                    }
                    .skillpath-card,
                    .skillpath-skeleton {
                        padding: 22px;
                        min-height: 250px;
                    }
                    .skillpath-title {
                        font-size: 21px;
                    }
                    .skillpath-meta {
                        align-items: flex-start;
                        flex-direction: column;
                        gap: 6px;
                    }
                    .skillpath-price {
                        white-space: nowrap;
                    }
                }
            `}</style>

            <div className="skillpath-root">
                <h2 className="skillpath-header">{sectionTitle}</h2>

                <div className="skillpath-controls">
                    <div className="skillpath-searchWrap">
                        <span
                            className="skillpath-searchIcon"
                            aria-hidden="true"
                        >
                            ⌕
                        </span>
                        <input
                            aria-label="Search courses"
                            className="skillpath-search"
                            type="text"
                            placeholder="Search courses..."
                            value={searchQuery}
                            onChange={(event) =>
                                startTransition(() =>
                                    setSearchQuery(event.target.value)
                                )
                            }
                        />
                    </div>
                    <select
                        aria-label="Sort courses by price"
                        className="skillpath-sort"
                        value={sortBy}
                        onChange={(event) =>
                            startTransition(() =>
                                setSortBy(event.target.value as SortOption)
                            )
                        }
                    >
                        <option value="default">Default</option>
                        <option value="priceLowToHigh">
                            Price: Low to High
                        </option>
                        <option value="priceHighToLow">
                            Price: High to Low
                        </option>
                    </select>
                </div>

                {isLoading ? (
                    <div
                        className="skillpath-grid"
                        aria-label="Loading courses"
                    >
                        {Array.from({ length: 6 }).map((_, index) => (
                            <div
                                className="skillpath-skeleton"
                                key={`skeleton-${index}`}
                                aria-hidden="true"
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        gap: 8,
                                        marginBottom: 8,
                                    }}
                                >
                                    <div
                                        className="skillpath-skeleton-line"
                                        style={{ width: "34%" }}
                                    />
                                    <div
                                        className="skillpath-skeleton-line"
                                        style={{
                                            width: "24%",
                                            height: 22,
                                            borderRadius: 999,
                                        }}
                                    />
                                </div>
                                <div
                                    className="skillpath-skeleton-line"
                                    style={{
                                        width: "80%",
                                        height: 22,
                                        marginBottom: 16,
                                    }}
                                />
                                <div
                                    className="skillpath-skeleton-line"
                                    style={{ width: "100%" }}
                                />
                                <div
                                    className="skillpath-skeleton-line"
                                    style={{ width: "86%", marginBottom: 22 }}
                                />
                                <div
                                    className="skillpath-skeleton-line"
                                    style={{
                                        width: "100%",
                                        height: 1,
                                        marginBottom: 14,
                                    }}
                                />
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        gap: 12,
                                    }}
                                >
                                    <div
                                        className="skillpath-skeleton-line"
                                        style={{ width: "28%" }}
                                    />
                                    <div
                                        className="skillpath-skeleton-line"
                                        style={{ width: "26%", height: 20 }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : hasCourseError ? (
                    <div
                        className="skillpath-status"
                        role="alert"
                        aria-live="assertive"
                    >
                        <strong style={{ fontSize: 16 }}>
                            Couldn’t load courses right now.
                        </strong>
                        <span style={{ fontSize: 14, opacity: 0.8 }}>
                            Please check your connection and try again.
                        </span>
                        <button
                            className="skillpath-btn"
                            aria-label="Try loading courses again"
                            onClick={loadData}
                        >
                            Try Again
                        </button>
                    </div>
                ) : courses.length === 0 ? (
                    <div
                        className="skillpath-status"
                        role="status"
                        aria-live="polite"
                    >
                        <strong style={{ fontSize: 16 }}>
                            No courses available right now.
                        </strong>
                        <span style={{ fontSize: 14, opacity: 0.8 }}>
                            Check back soon or refresh to try again.
                        </span>
                        <button
                            className="skillpath-btn"
                            aria-label="Refresh courses list"
                            onClick={loadData}
                        >
                            Refresh
                        </button>
                    </div>
                ) : visibleCourses.length === 0 ? (
                    <div
                        className="skillpath-status"
                        role="status"
                        aria-live="polite"
                    >
                        <strong style={{ fontSize: 16 }}>
                            No courses found
                        </strong>
                        <span style={{ fontSize: 14, opacity: 0.8 }}>
                            Try searching for a different course or topic.
                        </span>
                        <div className="skillpath-actions">
                            <button
                                className="skillpath-btn"
                                aria-label="Refresh courses list"
                                onClick={loadData}
                            >
                                Refresh
                            </button>
                            <button
                                className="skillpath-btn skillpath-btnSecondary"
                                aria-label="Clear course search"
                                onClick={() =>
                                    startTransition(() => setSearchQuery(""))
                                }
                            >
                                Clear Search
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="skillpath-grid" aria-label="Course results">
                        {visibleCourses.map((course) => {
                            const shortCourse = course.shortCourse?.trim()
                            const courseType = course.courseType?.trim()

                            return (
                                <article
                                    className="skillpath-card"
                                    key={course.mangoId}
                                >
                                    <div className="skillpath-top">
                                        {course.mainCategory ? (
                                            <span className="skillpath-category">
                                                {course.mainCategory}
                                            </span>
                                        ) : null}
                                        {refundableBadge &&
                                        course.refundable ? (
                                            <span className="skillpath-badge">
                                                Refundable
                                            </span>
                                        ) : null}
                                    </div>
                                    <h3 className="skillpath-title">
                                        {course.courseName}
                                    </h3>
                                    <p className="skillpath-description">
                                        {course.description || ""}
                                    </p>
                                    <div className="skillpath-meta">
                                        {shortCourse || courseType ? (
                                            <span className="skillpath-type">
                                                {shortCourse ? (
                                                    <span>{shortCourse}</span>
                                                ) : null}
                                                {shortCourse && courseType ? (
                                                    <span className="skillpath-separator">
                                                        •
                                                    </span>
                                                ) : null}
                                                {courseType ? (
                                                    <span>{courseType}</span>
                                                ) : null}
                                            </span>
                                        ) : null}
                                        <span className="skillpath-price">
                                            {formatInrPrice(course)}
                                        </span>
                                    </div>
                                </article>
                            )
                        })}
                    </div>
                )}
            </div>
        </section>
    )
}

addPropertyControls(SkillpathCourses, {
    sectionTitle: {
        type: ControlType.String,
        defaultValue: "Explore Courses",
        title: "Section Title",
    },
    refundableBadge: {
        type: ControlType.Boolean,
        defaultValue: true,
        title: "Refundable Badge",
        enabledTitle: "On",
        disabledTitle: "Off",
    },
})
