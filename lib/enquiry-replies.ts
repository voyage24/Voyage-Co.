// Suggested reply drafts per enquiry type, so the admin reply box opens
// pre-filled and rarely needs composing from scratch. Returns the message BODY
// only — the email template adds the "Dear <name>" greeting and the sign-off.

type EnquiryLike = { type: string; subject?: string | null; itemTitle?: string | null };

function subjectRef(subject?: string | null): string {
  const m = /VC-[A-Z0-9]+/i.exec(subject || "");
  return m ? m[0].toUpperCase() : "";
}

export function draftReply(e: EnquiryLike): string {
  const item = e.itemTitle ? ` regarding ${e.itemTitle}` : "";
  const ref = subjectRef(e.subject);
  const refLine = ref ? ` (reference ${ref})` : "";

  switch (e.type) {
    case "change":
      return `Thank you for your change request${item}${refLine}. Our concierge team has received it and is reviewing the requested amendments. We will confirm the updated details, availability and any difference in fare shortly.\n\nIf you have a preferred date or any specific requirement, do let us know and we will be glad to accommodate it.`;
    case "callback":
      return `Thank you for requesting a callback. Our concierge team will be in touch at your convenience. If there is anything specific you would like us to prepare ahead of the call — a destination, dates or a particular request — simply reply to this note.`;
    case "flight":
      return `Thank you for your flight enquiry${item}. Our team is sourcing the best available fares and routing for your dates and will share a selection of options shortly.\n\nIf you have a preferred airline, cabin class or timing, please let us know so we can tailor the recommendations.`;
    case "group":
      return `Thank you for your group travel enquiry. We would be delighted to craft a tailored proposal for your party. To prepare the best options, could you kindly confirm your group size, preferred dates and destination(s)?`;
    case "insurance":
      return `Thank you for your travel insurance enquiry. We will prepare suitable cover options for your journey and share the details shortly. To tailor the quote precisely, please confirm your travel dates and the number of travellers.`;
    case "notify":
      return `Thank you for your interest${item}. We have noted your request and will notify you the moment it becomes available. We will be in touch as soon as we have an update to share.`;
    case "planner":
      return `Thank you for sharing your travel plans. Our concierge team is delighted to help design your journey and will be in touch shortly with initial ideas.\n\nIn the meantime, please feel free to share any must-haves, preferred experiences or special occasions we should build around.`;
    case "quiz":
      return `Thank you for completing our travel quiz. Based on your preferences, our concierge team is curating a few tailored recommendations and will share them with you shortly.`;
    case "visa":
      return `Thank you for your visa assistance enquiry. Our team will guide you through the requirements and documentation for your destination. To advise precisely, please share your nationality and intended travel dates.`;
    case "service":
      return `Thank you for your request. Our concierge team has received it and will arrange the details, confirming everything with you shortly.`;
    case "contact":
      return `Thank you for reaching out to Voyages & Co. We have received your message and our concierge team will respond in detail very shortly.\n\nPlease let us know if there is anything further we can prepare for you in the meantime.`;
    default:
      return `Thank you for your enquiry${item}${refLine}. Our concierge team has received it and will respond with full details shortly. Please let us know if there is anything further we can assist you with.`;
  }
}
