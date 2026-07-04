import streamlit as st
import time
from agent import scrape_aapkapainter, push_to_supabase

st.set_page_config(page_title="Competitor Intelligence Agent", page_icon="🕵️", layout="wide")

st.title("🕵️ Competitor Intelligence Extraction Agent")
st.markdown("This agent autonomously scrapes competitor products from target URLs and pushes the structured data to your Supabase ERP instance.")

st.sidebar.header("Configuration")
target_url = st.sidebar.text_input("Target URL", "https://aapkapainter.com/products/paints")
use_ai = st.sidebar.checkbox("Use AI Extraction (API Key required)", value=False)

if 'extraction_logs' not in st.session_state:
    st.session_state.extraction_logs = []
if 'extracted_data' not in st.session_state:
    st.session_state.extracted_data = None

def run_agent():
    st.session_state.extraction_logs = []
    st.session_state.extracted_data = None
    
    with st.spinner("Agent is running..."):
        # We capture the generator output to simulate live logs
        generator = scrape_aapkapainter()
        
        while True:
            try:
                result = next(generator)
                if isinstance(result, dict) and "status" in result:
                    st.session_state.extraction_logs.append(result)
                else:
                    # Final result is the data list
                    st.session_state.extracted_data = result
                    break
            except StopIteration as e:
                if e.value is not None:
                    st.session_state.extracted_data = e.value
                break
            except Exception as e:
                st.session_state.extraction_logs.append({"status": "error", "message": str(e)})
                break

def sync_data():
    def progress_callback(log):
        st.session_state.extraction_logs.append(log)
        
    with st.spinner("Syncing to Supabase..."):
        result = push_to_supabase(st.session_state.extracted_data, progress_callback)
        if result.get("success"):
            st.success(f"Synced {result.get('count')} products to database!")
        else:
            st.error(f"Sync failed: {result.get('error')}")

col1, col2 = st.columns([2, 3])

with col1:
    st.subheader("Agent Control")
    if st.button("🚀 Start Extraction", type="primary", use_container_width=True):
        run_agent()
        
    st.markdown("### Activity Log")
    log_container = st.container(height=400)
    with log_container:
        for log in st.session_state.extraction_logs:
            if log['status'] == 'info':
                st.info(log['message'])
            elif log['status'] == 'success':
                st.success(log['message'])
            elif log['status'] == 'error':
                st.error(log['message'])

with col2:
    st.subheader("Extracted Data Preview")
    if st.session_state.extracted_data:
        st.dataframe(st.session_state.extracted_data, use_container_width=True)
        
        if st.button("☁️ Sync to Database", type="secondary", use_container_width=True):
            sync_data()
    else:
        st.info("No data extracted yet. Click 'Start Extraction' to run the agent.")
