import React from "react";
import { useAuth } from "../../../../../context/AuthContext";

/**
 * ClassicCVTemplate
 * A classically styled, highly professional CV template for print/export.
 * Props:
 *   - cv: object (structure from /app/cv-profiles/)
 */
const ClassicCVTemplate: React.FC<{ cv: any }> = ({ cv }) => {
  const { user } = useAuth();

  // Personal Data extraction
  const personal = (() => {
    if (cv.personal) {
      return {
        fullName: cv.personal.fullName || cv.personal.full_name || user?.full_name || "",
        email: cv.personal.email || user?.email || "",
        phone: cv.personal.phone || user?.phone_number || "",
        address: cv.personal.address || user?.address || "",
        country: cv.personal.country || user?.country || "",
        summary: cv.summary || cv.personal.summary || "",
        photo: cv.personal.photo || cv.photo || user?.profile_picture_url || null
      };
    } else {
      return {
        fullName: cv.fullName || cv.full_name || user?.full_name || "",
        email: cv.email || user?.email || "",
        phone: cv.phone || user?.phone_number || "",
        address: cv.address || user?.address || "",
        country: cv.country || user?.country || "",
        summary: cv.summary || "",
        photo: cv.photo || user?.profile_picture || null
      };
    }
  })();

  // Classical Section Heading
  const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div style={{
      marginBottom: "25px"
    }}>
      <div
        style={{
          fontFamily: "'Times New Roman', Times, serif",
          fontSize: "1.19rem",
          borderBottom: "1.5px solid #2d2d2d",
          color: "#19326b",
          fontWeight: 700,
          letterSpacing: 1.4,
          marginBottom: 10,
          paddingBottom: 2,
          textTransform: "uppercase"
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );

  // Dates helpers
  const eduDateRange = (e: any) =>
    (e.start_year ? e.start_year : "") +
    (e.end_year ? (e.start_year ? " – " : "") + e.end_year : "");
  const xpDateRange = (xp: any) =>
    (xp.start_month ? `${xp.start_month} ` : "") +
    (xp.start_year || "") +
    ((xp.end_month || xp.end_year) ? " – " : "") +
    (xp.current ? "Present" : ((xp.end_month ? `${xp.end_month} ` : "") + (xp.end_year || "")));

  // Classical Skill String
  const skillString = (skills: any[]) =>
    skills.map(s => s.skill || s).join(", ");

  // Classical separator
  const separator = (
    <span style={{ color: "#b0b0b0", margin: "0 6px" }}>|</span>
  );

  return (
    <div
      style={{
        fontFamily: "'Times New Roman', Times, serif",
        color: "#19191A",
        background: "#fff",
        padding: "40px 52px 46px 52px",
        fontSize: "15.5px",
        minWidth: 640,
        maxWidth: 760,
        margin: "0 auto",
        boxShadow: "0 1px 8px #e4e4e4",
        border: "1.4px solid #EAEAEA"
      }}
    >
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "2.2px solid #232323",
          paddingBottom: 18,
          marginBottom: 28
        }}
      >
        <div style={{ flexGrow: 1 }}>
          <div
            style={{
              fontSize: "2.13rem",
              fontWeight: 800,
              fontFamily: "'Times New Roman', Times, serif",
              textTransform: "uppercase",
              color: "#183054",
              letterSpacing: 2.6,
              marginBottom: 2,
            }}
          >
            {personal.fullName || ""}
          </div>
          {personal.summary && (
            <div
              style={{
                fontStyle: "italic",
                fontWeight: 400,
                color: "#2e2f3a",
                fontSize: "16.2px",
                margin: "8px 0 4px 0",
                lineHeight: 1.45,
              }}
            >
              {personal.summary}
            </div>
          )}
          {(personal.email || personal.phone || personal.address || personal.country) && (
            <div
              style={{
                color: "#27374d",
                fontSize: "14px",
                fontFamily: "'Georgia', serif",
                marginTop: 10
              }}
            >
              {personal.email && <span>{personal.email}</span>}
              {personal.email && personal.phone && separator}
              {personal.phone && <span>{personal.phone}</span>}
              {(personal.email || personal.phone) && (personal.address || personal.country) && separator}
              {personal.address && <span>{personal.address}</span>}
              {personal.address && personal.country && separator}
              {personal.country && <span>{personal.country}</span>}
            </div>
          )}
        </div>
        {personal.photo && typeof personal.photo === "string" && (
          <div
            style={{
              width: 110,
              height: 132,
              border: "2px solid #b3b3b3",
              background: "#f7f7f7",
              borderRadius: 2,
              marginLeft: 25,
              boxShadow: "0 1px 6px #ececec",
              objectFit: "cover",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <img
              src={personal.photo}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: 2,
              }}
            />
          </div>
        )}
      </div>

      {/* EDUCATION */}
      {cv.education && cv.education.length > 0 && (
        <Section title="Education">
          {cv.education.map((ed: any, i: number) => (
            <div key={ed.id || i} style={{ marginBottom: 17 }}>
              <div style={{
                fontWeight: 700,
                fontSize: 16.7,
                color: "#1a1d25",
                fontFamily: "'Times New Roman', Times, serif",
                marginBottom: 1
              }}>
                {ed.degree || ""}{ed.field ? `, ${ed.field}` : ""}
              </div>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 15.1,
                fontStyle: "normal",
                marginBottom: 2
              }}>
                <span style={{ color: "#2e4053" }}>
                  {ed.institution || ""}
                </span>
                <span style={{
                  color: "#333",
                  fontStyle: "italic",
                  letterSpacing: 0.7
                }}>
                  {eduDateRange(ed)}
                </span>
              </div>
              {ed.grade && (
                <div style={{ color: "#213485", fontSize: 14.2, fontStyle: "italic" }}>
                  Grade: {ed.grade}
                </div>
              )}
              {ed.description && (
                <div style={{
                  marginTop: 2,
                  color: "#4d4d55",
                  fontSize: 14.6,
                  fontFamily: "'Georgia', serif",
                  lineHeight: 1.35
                }}>
                  {ed.description}
                </div>
              )}
            </div>
          ))}
        </Section>
      )}

      {/* EXPERIENCE */}
      {cv.experience && cv.experience.length > 0 && (
        <Section title="Professional Experience">
          {cv.experience.map((xp: any, i: number) => (
            <div key={xp.id || i} style={{ marginBottom: 17 }}>
              <div style={{
                fontWeight: 700,
                fontSize: 16.3,
                color: "#0E1932",
                fontFamily: "'Times New Roman', Times, serif",
                marginBottom: 0
              }}>
                {xp.position || ""}
                {xp.organization && (
                  <span style={{
                    fontWeight: 400,
                    color: "#465066",
                    fontFamily: "'Georgia', serif"
                  }}>
                    {`, ${xp.organization}`}
                  </span>
                )}
              </div>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 15.1,
                marginBottom: 2
              }}>
                <span style={{ color: "#3a3a52" }}>
                  {xp.location || ""}
                </span>
                <span style={{
                  color: "#363648",
                  fontStyle: "italic",
                  letterSpacing: 0.3,
                  fontSize: 14.1
                }}>
                  {xpDateRange(xp)}
                </span>
              </div>
              {xp.description && (
                <div style={{
                  color: "#36363E",
                  lineHeight: 1.38,
                  fontSize: 14.5,
                  marginTop: 2,
                  fontFamily: "'Georgia', serif"
                }}>
                  {xp.description}
                </div>
              )}
            </div>
          ))}
        </Section>
      )}

      {/* CERTIFICATIONS */}
      {cv.certifications && cv.certifications.length > 0 && (
        <Section title="Certifications">
          <ul style={{ listStyle: "circle inside", margin: 0, paddingLeft: 0, fontSize: 15 }}>
            {cv.certifications.map((c: any, i: number) => (
              <li key={c.id || i} style={{ marginBottom: 8 }}>
                <span style={{ fontWeight: 700 }}>
                  {c.name}
                </span>
                {c.issuer && (
                  <span style={{ color: "#555", fontWeight: 400 }}>
                    {", " + c.issuer}
                  </span>
                )}
                {(c.issue_month || c.issue_year) && (
                  <span style={{ marginLeft: 8, color: "#444", fontStyle: "italic" }}>
                    ({c.issue_month ? c.issue_month : ""}{c.issue_month && c.issue_year ? " " : ""}{c.issue_year || ""})
                  </span>
                )}
                {c.description && (
                  <div style={{
                    marginLeft: 0,
                    marginTop: 2,
                    fontSize: 14.2,
                    color: "#5b5660",
                    fontFamily: "'Georgia', serif"
                  }}>
                    {c.description}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* SKILLS */}
      {cv.skills && cv.skills.length > 0 && (
        <Section title="Key Skills">
          <div style={{
            fontSize: 15.1,
            color: "#20223b",
            fontFamily: "'Times New Roman', Times, serif",
            marginBottom: 2
          }}>
            {skillString(cv.skills)}
          </div>
        </Section>
      )}

      {/* LANGUAGES */}
      {cv.languages && cv.languages.length > 0 && (
        <Section title="Languages">
          <ul style={{
            margin: 0,
            paddingLeft: 24,
            fontSize: 15,
            fontFamily: "'Times New Roman', Times, serif",
            lineHeight: 1.42
          }}>
            {cv.languages.map((l: any, i: number) => (
              <li key={l.id || i}>
                <span style={{ fontWeight: 600 }}>{l.name}</span>
                {l.proficiency && (
                  <span style={{
                    color: "#6b6b88",
                    fontSize: 14.1,
                    fontFamily: "'Georgia', serif",
                    fontStyle: "italic",
                    marginLeft: 4
                  }}>
                    ({l.proficiency})
                  </span>
                )}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* PUBLICATIONS */}
      {cv.publications && cv.publications.length > 0 && (
        <Section title="Publications">
          <ol style={{
            margin: 0,
            paddingLeft: 26,
            fontSize: 15,
            fontFamily: "'Times New Roman', Times, serif"
          }}>
            {cv.publications.map((p: any, i: number) => (
              <li key={p.id || i} style={{ marginBottom: 9 }}>
                <span style={{ fontWeight: 700 }}>{p.title}</span>
                {p.journal && (
                  <>.<span style={{ fontStyle: 'italic', color: "#454792" }}> {p.journal}</span></>
                )}
                {p.year && <>. <span>{p.year}</span></>}
                {p.link && (
                  <>.&nbsp;
                    <a
                      href={/^https?:\/\//.test(p.link) ? p.link : `https://${p.link}`}
                      style={{
                        color: "#5a4496",
                        textDecoration: "underline",
                        fontSize: 14.2,
                        fontFamily: "'Georgia', serif"
                      }}
                      target="_blank" rel="noopener noreferrer"
                    >{p.link}</a>
                  </>
                )}
                {p.description && (
                  <div style={{
                    color: "#4e4d53",
                    fontSize: 14,
                    fontFamily: "'Georgia', serif"
                  }}>{p.description}</div>
                )}
              </li>
            ))}
          </ol>
        </Section>
      )}
    </div>
  );
}

export default ClassicCVTemplate;
