


/// import

import { Resend } from "dep/x/resend.ts";

/// util

import { serviceResend } from "src/utility/env.ts";



/// export

export const resend = new Resend(serviceResend);
