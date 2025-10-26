# How to Fill Form-C - Complete Guide

> **Lessons from Nepali Form-C Counter Team**  
> Sharadpoornima Sadhana Shivir 2025


## 🎯 Quick Start Guide

### Opening the Form
1. Click **"Add Devotee"** button on dashboard
2. The form opens with multiple sections (accordion-style)
3. You can fill sections in **any order**
4. Form **auto-saves every 15 seconds** - no data loss!

---

## 📋 Section-by-Section Guide

### 1. Basic Details Section

#### Given Name & Family Name
- **For Nepali**: Ignore "Shree" or "Shree Mati" prefix
  - ✅ Correct: `rama adhikari`
  - ❌ Wrong: `shreemati rama adhikari`

#### Date of Birth (DOB)
- **Important**: Click the **BS button** (📅) next to DOB field for Nepali dates
- Enter in format: `YYYY/MM/DD` (e.g., `2081/01/15`)
- System automatically converts to AD date

**Special Cases**:
- If DOB not present on citizenship, only age is written:
  - Calculate: `Issue Date - Age = Birth Year`
  - Use `01/01` as month/day
  - Example: If citizenship issued 2070 and age written is 25
    - Birth year = 2070 - 25 = 2045
    - Enter: `2045/01/01`

#### Gender
- Select from dropdown: Male / Female / Other

#### Nationality
- Select from dropdown
- Most common: **Nepal**, India, USA

---

### 2. Permanent Address Section

#### Copy Address Feature
The system has a **"Copy Address"** button to make filling easier:
- If **Arrival Address = Permanent Address**: Use copy button
- If **Temporary Address = Permanent Address**: Use copy button
- If **Temporary Address = Arrival Address**: Use copy button

#### Address Fields
- **Street/Area**: House number, street name
- **City/District**: ⚠️ Important - Include district name for accurate address
- **State/Province**: Province name
- **Country**: Usually same as nationality

---

### 3. Contact Information Section

#### Phone Number
- Enter with country code if international
- For Nepali: Enter 10-digit mobile number

#### Email (Optional)
- Not required but helpful
- Enter if devotee provides

---

### 4. Identity Document Section

#### Document Type Selection
We accept **multiple types** of ID documents:

**For Nepali Citizens**:
- ✅ Citizenship Certificate (नागरिकता)
- ✅ National Identity Card (NID)
- ✅ Voter ID
- ✅ Driver License
- ✅ Passport
- ✅ PAN Card
- ✅ Birth Certificate
- ✅ Student ID Card

**For International**:
- ✅ Passport
- ✅ National ID from their country
- ✅ Driver License

#### Identity Number
- **Critical**: Enter the ID number from the document you selected
- ⚠️ **Do NOT enter citizenship number if you're filling Driver License**
  - Example: If document type = "Driver License", enter the **driver license number**
  - Example: If document type = "NID", enter the **NID number**

#### Issuing Country
- Usually same as nationality
- Select from dropdown

#### Expiry Date
- Click **BS button** for Nepali documents
- If no expiry date visible: System auto-fills with +100 years

---

### 5. Visa Details Section

#### For Nepali Citizens
- **Auto-filled with dummy data** when nationality = Nepal
- Fields will show: 
  - Visa Number: `0`
  - Visa Type: `N/A`
  - Issue Date: `2025-01-01`
  - Expiry: `2099-12-31`
- No manual entry needed!

#### For International Visitors
- Enter actual visa details from passport
- Use **BS converter** if dates are in Bikram Sambat

---

### 6. Visit Details Section

#### Arrival Date & Time
- Click calendar icon
- Select date and time of arrival
- Pre-filled with current date/time

#### Arrival Location
- Select from dropdown:
  - Main Gate
  - Side Entrance
  - Airport Pickup
  - Bus Stand

#### Temporary Address (Current Room)
- Where the devotee is staying in ashram
- Room number or building name
- **Can copy from permanent address** if same

#### Planned Departure
- Expected checkout date
- Optional but recommended

#### Purpose of Visit
- Select from dropdown:
  - Pilgrimage
  - Retreat
  - Seva (Service)
  - Program Participation
  - Personal Visit

#### Host/Contact Person
- Pre-filled with: "Ashram Administration"
- Change if specific host person

---

### 7. Photo Upload (Optional)

#### Two Options:
1. **Webcam Capture**: Click camera icon, take photo
2. **File Upload**: Click upload, select image file

#### Photo Tips:
- System auto-compresses to <50KB
- Face should be clearly visible
- Good lighting preferred
- Not mandatory but helpful

---

## 🔍 Reading Nepali Citizenship Documents

### Standard Citizenship Format

```
┌─────────────────────────────────────┐
│  नागरिकता प्रमाणपत्र              │
│                                     │
│  नाम: राम बहादुर श्रेष्ठ            │
│  (Name: Ram Bahadur Shrestha)       │
│                                     │
│  जन्म मिति: २०४५/०१/०१             │
│  (Date of Birth: 2045/01/01)        │
│                                     │
│  प्रमाण पत्र नं: १२३४५              │
│  (Certificate No: 12345)            │
│                                     │
│  जारी मिति: २०७०/०५/१५             │
│  (Issue Date: 2070/05/15)           │
└─────────────────────────────────────┘
```

### Common Issues & Solutions

#### 1. Old/Unreadable Citizenship
- **Solution**: Ask the devotee to read it
- Make best estimation based on visible letters
- Cross-check with other documents if available

#### 2. No DOB, Only Age Written
- **What you see**: "उमेर: २५ वर्ष" (Age: 25 years)
- **Formula**: Issue Date - Age = Birth Year
- **Enter**: Birth year with 01/01 as month/day

#### 3. "Shree" or "Shree Mati" Prefix
- **What you see**: "श्री राम बहादुर"
- **Ignore "श्री" (Shree)** - it's an honorific
- **Enter**: Just the actual name without prefix

#### 4. Multiple Names/Spellings
- Ask devotee for preferred spelling
- Use spelling that matches passport if they have one

---

## 🚨 Duplicate Detection System

The system automatically checks for duplicates as you fill the form:

### Level 1: Identity Number Match (🔴 RED - BLOCKED)
- **Trigger**: Same ID number already in database
- **Action**: Submission blocked completely
- **What to do**: 
  - Check if person already registered
  - Verify ID number is correct
  - If same person, don't re-register

### Level 2: Name + Nationality Match (🟠 ORANGE - WARNING)
- **Trigger**: Exact same name AND nationality
- **Action**: Requires your confirmation
- **What to do**:
  - Review the matching person's details
  - Check DOB, contact, ID number
  - If truly different person, click "Confirm - Add Anyway"
  - If same person, click "Cancel"

### Level 3: Name Only Match (🔵 BLUE - INFO)
- **Trigger**: Same name, different nationality
- **Action**: Gentle notice, can proceed
- **What to do**: Usually safe to proceed (common names like "Ram")

---

## 💾 Draft System

### Auto-Save
- Form saves automatically every 15 seconds
- You see "Auto-saved: [time]" at top
- Don't worry about losing work!

### Save to Draft
- Click **"Save to Draft"** button (blue)
- Draft appears in "Drafts" tab
- Can continue later or another day

### Pull from Draft
- Click **"Pull from Draft"** button
- Select draft from list
- Form fills with saved data
- Continue where you left off

---

## ⚠️ Important Counter Guidelines

### 1. Nepali Speaker Present
- **Highly recommended**: At least 1 Nepali speaker on duty 24/7
- Helps with:
  - Reading old/unclear citizenship cards
  - Spelling issues
  - Communication with devotees

### 2. Dealing with Agitated Devotees
- Remember: They've traveled 24+ hours by bus
- They're tired and want to enter ashram
- **Stay calm and polite**
- Explain the process kindly
- Try to be as quick as possible

### 3. Checking IDs
- Accept multiple types of ID (not just citizenship)
- If unclear, ask devotee to clarify
- Make best estimation if document is old

### 4. Common Mistakes to Avoid
- ❌ Entering citizenship number when document type is "Driver License"
- ❌ Including "Shree" prefix in name
- ❌ Not using BS converter for Nepali dates
- ❌ Not checking for duplicates before submitting

---

## 📊 Data Flow Diagram

```
User Opens Form
      ↓
Auto-save starts (every 15 seconds) → localStorage
      ↓
Fill sections in any order
      ↓
System checks for duplicates in real-time
      ↓
[Optional] Click "Save to Draft" → Drafts list → localStorage
      ↓
Navigate away? → Auto-save on unmount
      ↓
Return to form later? → Auto-restore from localStorage
      ↓
[Optional] "Pull from Draft" → Load saved draft
      ↓
Complete all required fields → Green checkmarks appear
      ↓
Click "Submit Entry" → Duplicate check runs
      ↓
No duplicates OR Approved? → Save to Database ✅
      ↓
Draft automatically deleted (if loaded from draft)
      ↓
Success! → Redirect to Dashboard
```

---

## 🎯 Quick Tips for Fast Entry

1. **Use BS Converter**: Always click BS button for Nepali dates
2. **Copy Address**: Use copy buttons to avoid retyping
3. **Tab Key**: Use Tab to move between fields quickly
4. **Ignore Prefixes**: Skip "Shree", "Shree Mati" in names
5. **Auto-fill Visa**: For Nepali, visa fills automatically
6. **Save Drafts**: If unsure about info, save as draft and confirm later
7. **Check Duplicates**: Let system warn you about existing entries

---

## 📞 Need Help?

If you encounter issues:
1. Check this guide first
2. Ask team leader (Milinda Bhaiya)
3. Use "Save to Draft" if you need time to verify information
4. Check the main README.md for technical issues

---

## ✅ Checklist Before Submitting

- [ ] Name entered without "Shree" prefix
- [ ] DOB converted from BS using BS button
- [ ] Correct ID type selected (citizenship/NID/driver/etc)
- [ ] ID number matches document type selected
- [ ] Nepali visa auto-filled (for Nepali nationals)
- [ ] Arrival date/time entered
- [ ] Temporary address (room number) entered
- [ ] No duplicate warnings (or warnings acknowledged)
- [ ] All green checkmarks visible on form sections

---

**Remember**: The system is designed to help you, not slow you down. Auto-save means no data loss. Duplicate detection prevents errors. Take your time to enter accurate information! 🙏

---

**Last Updated**: January 2025  
**Version**: 2.1.0  
**Team**: Nepali Form-C Counter
