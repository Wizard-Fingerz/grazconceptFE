import React from "react";

/**
 * ClassicCVTemplate
 * Renders a classical PDF-style CV based on the API structure.
 * This component is intended for print/export to PDF.
 * 
 * Props:
 *   - cv: object, in the same structure returned from /app/cv-profiles/ (see prompt)
 */
const ClassicCVTemplate: React.FC<{ cv: any }> = ({ cv }) => {
  // Helper: Section headline
  const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div style={{
      marginBottom: "18px"
    }}>
      <h2 style={{
        fontSize: "1.13rem",
        margin: 0,
        marginBottom: 6,
        letterSpacing: 1,
        fontWeight: 700,
        color: "#252525",
        borderBottom: "2px solid #e3e3e3",
        paddingBottom: 2,
        textTransform: "uppercase",
        fontFamily: "serif"
      }}>
        {title}
      </h2>
      {children}
    </div>
  );

  // Helper: Date range to string
  const eduDateRange = (e: any) =>
    (e.start_year ? e.start_year : "") +
    (e.end_year ? (e.start_year ? " - " : "") + e.end_year : "");

  const xpDateRange = (xp: any) =>
    (xp.start_month ? `${xp.start_month} ` : "") +
    (xp.start_year || "") +
    ((xp.end_month || xp.end_year) ? " - " : "") +
    (xp.current ? "Present" : ((xp.end_month ? `${xp.end_month} ` : "") + (xp.end_year || "")));

  // Helper: List as comma string
  const skillString = (skills: any[]) => skills.map(s => s.skill || s).join(", ");

  // Main
  return (
    <div
      style={{
        fontFamily: "Georgia, Times New Roman, serif",
        color: "#191919",
        background: "#fff",
        padding: 36,
        fontSize: 15,
        minWidth: 600,
        maxWidth: 820,
        margin: "0 auto"
      }}
    >
      {/* HEADER */}
      <div style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 28,
        borderBottom: "2px solid #aaa",
        paddingBottom: 16,
        marginBottom: 18
      }}>
        <div style={{ flexGrow: 1 }}>
          <div style={{
            fontSize: 30,
            fontWeight: 700,
            fontFamily: "serif",
            color: "#022A4D",
            marginBottom: 6
          }}>
            {cv.personal?.fullName || ""}
          </div>
          <div style={{
            fontWeight: 400,
            fontSize: 16,
            color: "#252525",
            marginBottom: 3
          }}>
            {cv.personal?.summary || cv.summary || ""}
          </div>
          <div style={{
            color: "#555",
            fontSize: 14
          }}>
            {(cv.personal?.email || cv.personal?.phone || cv.personal?.address || cv.personal?.country) &&
              <span>
                {cv.personal?.email && <span>{cv.personal?.email}</span>}
                {cv.personal?.phone && <span> &nbsp;|&nbsp; {cv.personal.phone}</span>}
                {cv.personal?.address && <span> &nbsp;|&nbsp; {cv.personal.address}</span>}
                {cv.personal?.country && <span> &nbsp;|&nbsp; {cv.personal.country}</span>}
              </span>
            }
          </div>
        </div>
        {/* Photo */}
        {cv.photo && typeof cv.photo === "string" && (
          <div>
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <img
              src={cv.photo}
              style={{
                width: 105,
                height: 125,
                objectFit: "cover",
                borderRadius: 8,
                border: "1.5px solid #ccc",
                background: "#fcfcfc"
              }}
            />
          </div>
        )}
      </div>

      {/* SECTION: EDUCATION */}
      {cv.education && cv.education.length > 0 && (
        <Section title="Education">
          {cv.education.map((ed: any, i: number) => (
            <div key={ed.id || i} style={{ marginBottom: 12 }}>
              <div style={{ fontWeight: 600, fontSize: 16 }}>
                {ed.degree || ""}{ed.field ? `, ${ed.field}` : ""}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15 }}>
                <span>
                  {ed.institution || ""}
                </span>
                <span style={{ color: "#444", fontStyle: "italic" }}>
                  {eduDateRange(ed)}
                </span>
              </div>
              {ed.grade && (
                <div style={{ color: "#337", fontSize: 14 }}>
                  Grade: {ed.grade}
                </div>
              )}
              {ed.description && (
                <div style={{ marginTop: 3, color: "#35343F", fontSize: 14 }}>
                  {ed.description}
                </div>
              )}
            </div>
          ))}
        </Section>
      )}

      {/* SECTION: EXPERIENCE */}
      {cv.experience && cv.experience.length > 0 && (
        <Section title="Experience">
          {cv.experience.map((xp: any, i: number) => (
            <div key={xp.id || i} style={{ marginBottom: 12 }}>
              <div style={{ 
                fontWeight: 600,
                fontSize: 16,
                color: "#0E1932"
              }}>
                {xp.position || ""}{xp.organization ? `, ${xp.organization}` : ""}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15 }}>
                <span>
                  {xp.location || ""}
                </span>
                <span style={{ color: "#444", fontStyle: "italic" }}>
                  {xpDateRange(xp)}
                </span>
              </div>
              {xp.description && (
                <div style={{ color: "#35343f", marginTop: 3, fontSize: 14 }}>
                  {xp.description}
                </div>
              )}
            </div>
          ))}
        </Section>
      )}

      {/* SECTION: CERTIFICATIONS */}
      {cv.certifications && cv.certifications.length > 0 && (
        <Section title="Certifications">
          {cv.certifications.map((c: any, i: number) => (
            <div key={c.id || i} style={{ marginBottom: 9 }}>
              <span style={{ fontWeight: 600 }}>
                {c.name}
              </span>
              {c.issuer && (
                <span style={{ color: "#555" }}>
                  {", " + c.issuer}
                </span>
              )}
              {(c.issue_month || c.issue_year) && (
                <span style={{ marginLeft: 8, color: "#444", fontStyle: "italic" }}>
                  ({c.issue_month ? c.issue_month : ""}{c.issue_month && c.issue_year ? " " : ""}{c.issue_year || ""})
                </span>
              )}
              {c.description && (
                <div style={{ marginLeft: 2, marginTop: 2, fontSize: 14, color: "#35343f" }}>
                  {c.description}
                </div>
              )}
            </div>
          ))}
        </Section>
      )}

      {/* SECTION: SKILLS */}
      {cv.skills && cv.skills.length > 0 && (
        <Section title="Skills">
          <div style={{ fontSize: 15, color: "#161928", fontFamily: "serif" }}>
            {skillString(cv.skills)}
          </div>
        </Section>
      )}

      {/* SECTION: LANGUAGES */}
      {cv.languages && cv.languages.length > 0 && (
        <Section title="Languages">
          <ul style={{ margin: 0, paddingLeft: 28, fontSize: 15 }}>
            {cv.languages.map((l: any, i: number) => (
              <li key={l.id || i}>
                {l.name} {l.proficiency ? (<span style={{ color: "#555", fontSize: 14 }}>({l.proficiency})</span>) : ""}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* SECTION: PUBLICATIONS */}
      {cv.publications && cv.publications.length > 0 && (
        <Section title="Publications">
          <ul style={{ margin: 0, paddingLeft: 28, fontSize: 15 }}>
            {cv.publications.map((p: any, i: number) => (
              <li key={p.id || i}>
                <span style={{ fontWeight: 600 }}>{p.title}</span>
                {p.journal && <>. <span style={{ fontStyle: "italic" }}>{p.journal}</span></>}
                {p.year && <>. <span>{p.year}</span></>}
                {p.link && (
                  <>.&nbsp;
                    <a
                      href={p.link}
                      style={{ color: "#1976d2", textDecoration: "underline", fontSize: 14 }}
                      target="_blank" rel="noopener noreferrer"
                    >{p.link}</a>
                  </>
                )}
                {p.description && (
                  <div style={{ color: "#35343f", fontSize: 14 }}>{p.description}</div>
                )}
              </li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  );
}

export default ClassicCVTemplate;
