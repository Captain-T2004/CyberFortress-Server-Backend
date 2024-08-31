pipeline {
    agent any

    environment {
        VENV_NAME = 'endpoint-extractor-venv'
        MONGO_USER = credentials('mongo-user')
        MONGO_PASS = credentials('mongo-pass')
        MONGO_URI = credentials('mongo-uri')
    }
    
    parameters {
        string(name: 'TARGET_URL', defaultValue: 'https://54.165.189.43/active', description: 'The URL to send the GET request to')
        string(name: 'TARGET_VALUE', defaultValue: 'http://4.240.48.35:4444', description: 'The value for the "target" key in the JSON body')
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Setup Python') {
            steps {
                sh """
                    python3 -m venv ${VENV_NAME}
                    . ${VENV_NAME}/bin/activate
                    pip install --upgrade pip
                    pip install pymongo pyyaml requests
                """
            }
        }

        stage('Process Endpoints') {
            steps {
                script {
                    writeFile file: 'process_endpoints.py', text: '''
import ast
import yaml
import re
import os

def extract_docstring(node):
    """Extract the docstring from a function node."""
    return ast.get_docstring(node)

def parse_openapi_comment(comment):
    """Parse the YAML content from a docstring comment."""
    comment = comment.strip('"""').strip()
    try:
        return yaml.safe_load(comment)
    except yaml.YAMLError as e:
        print(f"Error parsing YAML content: {e}")
        return None

def extract_route_info(decorator):
    """Extract route information from a decorator."""
    route_info = {'path': None, 'methods': []}
    if isinstance(decorator, ast.Call) and isinstance(decorator.func, ast.Attribute):
        if decorator.func.attr == 'route':
            if decorator.args:
                route_info['path'] = decorator.args[0].s
            for keyword in decorator.keywords:
                if keyword.arg == 'methods':
                    if isinstance(keyword.value, ast.List):
                        route_info['methods'] = [elt.s for elt in keyword.value.elts]
        elif decorator.func.attr in ['get', 'post', 'put', 'delete', 'patch']:
            if decorator.args:
                route_info['path'] = decorator.args[0].s
            route_info['methods'] = [decorator.func.attr.upper()]
    return route_info

def extract_endpoints(source_code):
    """Extract endpoints and their details from source code."""
    tree = ast.parse(source_code)
    endpoints = []

    for node in ast.walk(tree):
        if isinstance(node, ast.FunctionDef):
            docstring = extract_docstring(node)
            if docstring and '---' in docstring:
                endpoint_info = parse_openapi_comment(docstring)
                if endpoint_info:
                    for decorator in node.decorator_list:
                        route_info = extract_route_info(decorator)
                        if route_info['path']:
                            endpoint_info['path'] = route_info['path']
                            endpoint_info['methods'] = route_info['methods']
                            endpoints.append(endpoint_info)

    return endpoints

def parse_path_parameters(path):
    """Parse path parameters from the path string."""
    path_params = re.findall(r'<(?:(?:string|int|float|path):)?(\\w+)>', path)
    return path_params

def generate_openapi_spec(endpoints, info):
    """Generate an OpenAPI specification from endpoints."""
    openapi_spec = {
        "openapi": "3.0.0",
        "info": info,
        "paths": {}
    }

    for endpoint in endpoints:
        path = endpoint.get("path", "/")
        methods = endpoint.get("methods", ["GET"])
        
        # Replace Flask-style path parameters with OpenAPI style
        path_params = parse_path_parameters(path)
        if path_params:
            for param in path_params:
                path = path.replace(f'<{param}>', f'{{{param}}}')
                path = path.replace(f'<int:{param}>', f'{{{param}}}')
                path = path.replace(f'<float:{param}>', f'{{{param}}}')
                path = path.replace(f'<string:{param}>', f'{{{param}}}')
                path = path.replace(f'<path:{param}>', f'{{{param}}}')

        if path not in openapi_spec["paths"]:
            openapi_spec["paths"][path] = {}
        
        for method in methods:
            method = method.lower()
            if method not in openapi_spec["paths"][path]:
                openapi_spec["paths"][path][method] = {
                    "summary": endpoint.get("summary"),
                    "description": endpoint.get("description"),
                    "parameters": [],
                    "responses": endpoint.get("responses", {})
                }

            # Add path parameters if they're not already specified
            existing_param_names = [p['name'] for p in openapi_spec["paths"][path][method]["parameters"] if p['in'] == 'path']
            for param in path_params:
                if param not in existing_param_names:
                    openapi_spec["paths"][path][method]["parameters"].append({
                        "name": param,
                        "in": "path",
                        "required": True,
                        "schema": {"type": "string"}
                    })

    return openapi_spec

def process_directory(directory):
    """Process all Python files in the directory to extract endpoints."""
    all_endpoints = []

    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith('.py'):
                file_path = os.path.join(root, file)
                with open(file_path, 'r') as file:
                    source_code = file.read()
                    endpoints = extract_endpoints(source_code)
                    all_endpoints.extend(endpoints)

    return all_endpoints

def main(directory, output_path):
    """Main function to process files and generate OpenAPI specification."""
    endpoints = process_directory(directory)

    info = {
        "title": "Grid_Testing",
        "version": "1.0.0",
        "description": "APIs"
    }

    openapi_spec = generate_openapi_spec(endpoints, info)

    with open(output_path, 'w') as file:
        yaml.dump(openapi_spec, file, sort_keys=False)

    print(f"OpenAPI specification has been generated and saved to {output_path}")

if __name__ == "__main__":
    directory = "."  # Default to current directory
    output_path = "endpoints.yaml"
    main(directory, output_path)

'''

                    // Create a Python script to process endpoints and save to MongoDB
                    writeFile file: 'save_to_db.py', text: '''
import os
import yaml
from pymongo import MongoClient
import sys

# Get MongoDB credentials and connection info from command line arguments
username = sys.argv[1]
password = sys.argv[2]
cluster = sys.argv[3]
mongo_uri = "mongodb+srv://" + username + ":" + password + cluster
client = MongoClient(mongo_uri)
db = client['endpoints_db']
collection = db['endpoints']

def process_endpoints(root_dir):
    for root, dirs, files in os.walk(root_dir):
        for file in files:
            if file.endswith('.yaml') or file.endswith('.yml'):
                file_path = os.path.join(root, file)
                with open(file_path, 'r') as f:
                    try:
                        openapi_data = yaml.safe_load(f)
                        paths = openapi_data.get('paths', {})
                        for path, methods in paths.items():
                            endpoint_record = {
                                'path': path,
                                'methods': []
                            }
                            for method, details in methods.items():
                                method_record = {
                                    'method': method.upper(),
                                    'description': details.get('description', ''),
                                    'parameters': details.get('parameters', []),
                                    'responses': details.get('responses', {}),
                                }
                                method_record['responses'] = {str(key): value for key, value in method_record['responses'].items()}
                                endpoint_record['methods'].append(method_record)
                            collection.update_one(
                                {
                                    'path': path
                                },
                                {'$set': endpoint_record},
                                upsert=True
                            )
                    except yaml.YAMLError as e:
                        continue
                print(f"Processed: {file_path}")

if __name__ == "__main__":
    process_endpoints('.')
    print("Endpoint processing completed.")
'''
                    
                    writeFile file: 'send_request.py', text: '''
import requests
def send_request():
    url = "http://54.165.189.43:8000/active"
    headers = {
        "Content-Type": "application/json"
    }
    data = {
        "target": "http://4.240.48.35:4444"
    }

    try:
        requests.post(url, json=data, headers=headers, timeout=5)
    except Exception as e:
        print(f"An unexpected error occurred: {e}")

if __name__ == "__main__":
    send_request()

'''

                    // Run the Python script
                    sh """
                        . ${VENV_NAME}/bin/activate
                        python3 process_endpoints.py
                        python3 save_to_db.py '${MONGO_USER}' '${MONGO_PASS}' '${MONGO_URI}'
                        python3 send_request.py

                    """
                }
            }
        }
    }

    post {
        always {
            // Clean up
            sh """
                rm -rf ${VENV_NAME}
                rm process_endpoints.py
                rm save_to_db.py
                rm send_request.py
            """
        }
    }
}
